/*
 * 绘图与动画工具集（所有场景共用）
 *
 * 约定：场景在 setup 阶段建好全部元素并设成初始状态，时间线里只用 to()/set()。
 * 这样进度条任意拖动、倒退时，GSAP 都能把画面还原到对应时刻。
 * 注意：reveal()/pulse() 会改写元素的 transform，不要用在自带 transform 属性的元素上
 * （例如箭头三角、图标组），这类元素只用 fade()。
 */
(function (AB) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  // 配色：角色色与公式的三个组件一一对应，全片统一
  const C = {
    ink: '#1f2933',
    sub: '#52606d',
    faint: '#9aa5b1',
    line: '#d3d9e0',
    panel: '#f5f7fa',
    white: '#ffffff',
    llm: '#5b4fd6', llmBg: '#efedfc', // LLM / Model / 大脑
    ctx: '#0a7ea4', ctxBg: '#e3f3f8', // 上下文 / 眼睛 / 观察
    tool: '#c25e00', toolBg: '#fdf0de', // 工具 / 手脚 / 行动
    env: '#23824a', envBg: '#e6f4ea', // Environment
    harness: '#5f6b7a', harnessBg: '#f1f4f8',
    warn: '#c93c3c', warnBg: '#fbe9e9',
  };

  function el(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const key in attrs || {}) {
      if (attrs[key] != null) node.setAttribute(key, attrs[key]);
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  const g = (parent, attrs) => el('g', attrs, parent);

  function rect(parent, x, y, w, h, o = {}) {
    return el('rect', {
      x, y, width: w, height: h,
      rx: o.rx ?? 12,
      fill: o.fill ?? C.white,
      stroke: o.stroke ?? 'none',
      'stroke-width': o.sw ?? 2,
      'stroke-dasharray': o.dash,
    }, parent);
  }

  // str 可以是字符串，也可以是 [['片段', {fill, weight}], ...]，用于一行内混排多种颜色
  function text(parent, x, y, str, o = {}) {
    const t = el('text', {
      x, y,
      'font-size': o.size ?? 22,
      'font-weight': o.weight ?? 400,
      fill: o.fill ?? C.ink,
      'text-anchor': o.anchor ?? 'start',
      'dominant-baseline': 'central',
      'letter-spacing': o.spacing,
      class: o.mono ? 'mono' : null,
    }, parent);
    if (Array.isArray(str)) {
      for (const [s, so = {}] of str) {
        el('tspan', { fill: so.fill, 'font-weight': so.weight }, t).textContent = s;
      }
    } else {
      t.textContent = str;
    }
    return t;
  }

  function line(parent, x1, y1, x2, y2, o = {}) {
    return el('line', {
      x1, y1, x2, y2,
      stroke: o.stroke ?? C.line,
      'stroke-width': o.sw ?? 2,
      'stroke-dasharray': o.dash,
      'stroke-linecap': o.cap ?? 'round',
    }, parent);
  }

  function circle(parent, cx, cy, r, o = {}) {
    return el('circle', {
      cx, cy, r,
      fill: o.fill ?? C.ink,
      stroke: o.stroke,
      'stroke-width': o.sw,
    }, parent);
  }

  function path(parent, d, o = {}) {
    return el('path', {
      d,
      fill: o.fill ?? 'none',
      stroke: o.stroke,
      'stroke-width': o.sw ?? 2,
      'stroke-dasharray': o.dash,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, parent);
  }

  // 箭头 = 线段 + 独立的三角形箭头。建好时处于"未画出"状态，用 grow() 画出来
  function arrow(parent, x1, y1, x2, y2, o = {}) {
    const color = o.stroke ?? C.ink;
    const head = o.head ?? 14;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ex = x2 - Math.cos(ang) * head * 0.7;
    const ey = y2 - Math.sin(ang) * head * 0.7;
    const grp = g(parent);
    const ln = line(grp, x1, y1, ex, ey, { stroke: color, sw: o.sw ?? 3, dash: o.dash, cap: 'butt' });
    const hd = el('polygon', {
      points: `0,0 ${-head},${head * 0.55} ${-head},${-head * 0.55}`,
      fill: color,
      transform: `translate(${x2} ${y2}) rotate(${(ang * 180) / Math.PI})`,
    }, grp);
    gsap.set(ln, { attr: { x2: x1, y2: y1 } });
    gsap.set(hd, { autoAlpha: 0 });
    return { g: grp, line: ln, head: hd, x1, y1, x2: ex, y2: ey };
  }

  // 胶囊标签：按文字实际宽度定尺寸
  function pill(parent, cx, cy, label, o = {}) {
    const grp = g(parent);
    const size = o.size ?? 20;
    const bg = rect(grp, 0, 0, 0, 0, {
      fill: o.fill ?? C.panel, stroke: o.stroke ?? 'none', sw: o.sw ?? 2, dash: o.dash,
    });
    const t = text(grp, cx, cy, label, {
      size, weight: o.weight ?? 600, fill: o.color ?? C.ink, anchor: 'middle',
    });
    const p = { g: grp, rect: bg, text: t, w: o.w ?? measure(t) + (o.padX ?? 18) * 2, h: o.h ?? Math.round(size * 2.1) };
    bg.setAttribute('width', p.w);
    bg.setAttribute('height', p.h);
    bg.setAttribute('rx', o.rx ?? p.h / 2);
    placePill(p, cx, cy);
    return p;
  }

  function placePill(p, cx, cy) {
    p.rect.setAttribute('x', cx - p.w / 2);
    p.rect.setAttribute('y', cy - p.h / 2);
    p.text.setAttribute('x', cx);
    p.text.setAttribute('y', cy);
  }

  // 文字宽度：优先用浏览器实测；取不到时按"中文 1em、其他 0.56em"估算
  function measure(t) {
    const w = t.getComputedTextLength ? t.getComputedTextLength() : 0;
    if (w > 0) return w;
    const size = parseFloat(t.getAttribute('font-size')) || 20;
    let em = 0;
    for (const ch of t.textContent || '') em += ch.codePointAt(0) >= 0x2e80 ? 1 : 0.56;
    return em * size;
  }

  // 把若干 text 在一行内水平居中排开（会改写各自的 x），返回每个元素的 [左, 右]
  function layoutRow(items, cx, gap) {
    const widths = items.map(measure);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
    let x = cx - total / 2;
    return items.map((t, i) => {
      t.setAttribute('text-anchor', 'start');
      t.setAttribute('x', x);
      const span = [x, x + widths[i]];
      x += widths[i] + gap;
      return span;
    });
  }

  // ── 动画辅助：只生成 to()/set()，保证可拖动、可倒退 ──

  // 初始隐藏；dy/dx 让元素出现时带一点位移
  function hide(targets, o = {}) {
    const v = { autoAlpha: 0 };
    if (o.dy) v.y = o.dy;
    if (o.dx) v.x = o.dx;
    gsap.set(targets, v);
  }

  // 出现：透明度到 1，位移归零
  function reveal(tl, targets, o = {}, at) {
    return tl.to(targets, {
      autoAlpha: 1, x: 0, y: 0,
      duration: o.duration ?? 0.5,
      stagger: o.stagger,
      ease: o.ease ?? 'power2.out',
    }, at);
  }

  function fade(tl, targets, alpha, o = {}, at) {
    return tl.to(targets, {
      autoAlpha: alpha,
      duration: o.duration ?? 0.4,
      stagger: o.stagger,
      ease: o.ease ?? 'power1.out',
    }, at);
  }

  // 画箭头：线段从起点长到终点，然后出现箭头三角
  function grow(tl, a, o = {}, at) {
    tl.to(a.line, { attr: { x2: a.x2, y2: a.y2 }, duration: o.duration ?? 0.6, ease: o.ease ?? 'power2.inOut' }, at);
    return tl.to(a.head, { autoAlpha: 1, duration: 0.15 }, '>');
  }

  // 轻微放大再还原，用于强调
  function pulse(tl, targets, o = {}, at) {
    return tl.to(targets, {
      scale: o.scale ?? 1.08,
      transformOrigin: '50% 50%',
      duration: o.duration ?? 0.22,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1,
    }, at);
  }

  // 描边加粗再还原，表示"信号经过这里"
  function glow(tl, rectEl, o = {}, at) {
    const base = parseFloat(rectEl.getAttribute('stroke-width')) || 2;
    return tl.to(rectEl, {
      attr: { 'stroke-width': o.width ?? base + 3 },
      duration: o.duration ?? 0.25,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1,
    }, at);
  }

  // 两个元素原地交替：from 淡出，to 淡入
  function swap(tl, from, to, o = {}, at) {
    tl.to(from, { autoAlpha: 0, duration: o.duration ?? 0.3 }, at);
    return tl.to(to, { autoAlpha: 1, duration: o.duration ?? 0.3 }, '>-0.05');
  }

  AB.kit = {
    NS, C,
    el, g, rect, text, line, circle, path, arrow, pill, placePill, measure, layoutRow,
    hide, reveal, fade, grow, pulse, glow, swap,
  };
})(window.AB = window.AB || {});
