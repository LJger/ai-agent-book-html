#!/usr/bin/env python
"""
无头浏览器冒烟测试（不截图、不做视觉比对）：
    python tools/smoke.py ch01            测第一章
    python tools/smoke.py ch01 ch02       测多章
    python tools/smoke.py ch01 --quick    只翻页，不点按钮、不查布局

对每一页：进入 → 逐步按到最后一步 → 等入场动画结束 → 从 DOM 读取几何数据做布局检查
→ 依次点击页面里的按钮、开关、卡片（离开本页的会自动回来）→ 收集脚本报错。
布局检查只报告三类问题：元素越出 1920×1080 画布、设了 overflow 的容器内容被裁切、字号小于 14px。
确属有意为之的元素，加 data-ok-overflow 或 data-clip-ok 属性即可跳过。
"""
import sys
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = ROOT / 'web'

LAYOUT_JS = r"""
() => {
  const s = document.querySelector('#deck .slide.active');
  if (!s) return [];
  const out = [];
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
  const text = (el) => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);
  const deck = document.getElementById('deck').getBoundingClientRect(), sc = U.scale || 1;
  for (const el of s.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase();
    if (el.closest('svg') && tag !== 'svg') continue;
    if (el.closest('[data-ok-overflow]')) continue;
    if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const x = (r.left - deck.left) / sc, y = (r.top - deck.top) / sc, w = r.width / sc, h = r.height / sc;
    if (x < -4 || y < -4 || x + w > 1924 || y + h > 1084) out.push(`越界 ${name(el)} [${Math.round(x)},${Math.round(y)} ${Math.round(w)}×${Math.round(h)}] 「${text(el)}」`);
    const cs = getComputedStyle(el);
    const clips = /(hidden|clip)/.test(cs.overflow + cs.overflowX + cs.overflowY);
    if (clips && !el.closest('[data-clip-ok]') && (el.scrollHeight > el.clientHeight + 4 || el.scrollWidth > el.clientWidth + 4))
      out.push(`裁切 ${name(el)} 内容 ${el.scrollWidth}×${el.scrollHeight} > 容器 ${el.clientWidth}×${el.clientHeight} 「${text(el)}」`);
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own && parseFloat(cs.fontSize) < 14) out.push(`字号 ${cs.fontSize} ${name(el)} 「${text(el)}」`);
  }
  return out.slice(0, 12);
}
"""

CLICK_JS = r"""
async ([idx, steps]) => {
  const s = document.querySelectorAll('#deck .slide')[idx];
  const sel = 'button, .tgl, [data-i], [data-v], .flip, .chk, [data-act-click]';
  const els = [...s.querySelectorAll(sel)].filter((e) => !e.closest('#hud')).slice(0, 40);
  let n = 0;
  for (const el of els) {
    if (DECK.cur !== idx) { DECK.go(idx, steps); await new Promise((r) => setTimeout(r, 700)); }
    if (!el.isConnected) continue;
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); n++;
    await new Promise((r) => setTimeout(r, 160));
  }
  if (DECK.cur !== idx) { DECK.go(idx, steps); await new Promise((r) => setTimeout(r, 500)); }
  return n;
}
"""


def run(name, quick):
    path = WEB / f'{name}.html'
    if not path.exists():
        print(f'✗ {path} 不存在，先运行 node tools/build.mjs --only {name}')
        return 1
    errors, layout = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        cur = {'id': '(加载)'}
        page.on('console', lambda m: errors.append(f"[{cur['id']}] console.error: {m.text}") if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append(f"[{cur['id']}] 未捕获异常: {e}"))
        page.goto(path.as_uri())
        page.wait_for_function('window.DECK && DECK.cur >= 0', timeout=15000)
        n = page.evaluate("document.querySelectorAll('#deck .slide').length")
        clicks = 0
        for i in range(n):
            sid = page.evaluate(f"document.querySelectorAll('#deck .slide')[{i}].id")
            cur['id'] = sid
            page.evaluate(f'DECK.go({i}, 0)')
            page.wait_for_timeout(450)
            steps = page.evaluate(f"document.querySelectorAll('#deck .slide')[{i}]._steps")
            for _ in range(steps):
                page.evaluate('DECK.next()')
                page.wait_for_timeout(320)
            if not quick:
                page.wait_for_timeout(2600)
                for msg in page.evaluate(LAYOUT_JS):
                    layout.append(f'[{sid}] {msg}')
                clicks += page.evaluate(CLICK_JS, [i, steps])
        browser.close()
    print(f"{'✓' if not errors else '✗'} {name}：{n} 页，点击 {clicks} 个交互元素，脚本错误 {len(errors)} 个，布局提示 {len(layout)} 条")
    for e in errors[:60]:
        print('  ✗ ' + e)
    for m in layout[:120]:
        print('  △ ' + m)
    return 1 if errors else 0


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    quick = '--quick' in sys.argv
    if not args:
        print(__doc__)
        sys.exit(2)
    sys.exit(max(run(a, quick) for a in args))
