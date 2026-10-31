/* 演示引擎 · 核心（页面头部加载）：HOOKS 注册表、通用工具 U、背景粒子
 *
 * 每页的钩子：HOOKS['页面id'] = { init(s), enter(s, ctx, k, dir), step(s, ctx, k, dir), leave(s), reset(s) }
 *   init  —— 页面加载时调用一次，用来生成 DOM
 *   enter —— 进入页面时调用；k 是当前步，dir 是翻页方向（1 前进 / -1 后退）
 *   step  —— 在页内按 → / ← 切换步骤时调用
 *   leave / reset —— 离开页面时调用；reset 在离场动画结束后把页面恢复到初始状态
 * ctx 提供 later / every / raf，离开页面时自动清理，不会泄漏计时器。
 */
window.HOOKS = {};
window.U = {
  scale: 1,
  _id: 0,
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  ease: (t) => 1 - Math.pow(1 - t, 3),
  rand(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  ic: (n, c = '') => `<svg class="ic ${c}"><use href="#i-${n}"/></svg>`,
  // 鼠标在 1920×1080 画布内的坐标
  local(el, e) {
    const r = el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / U.scale, y: (e.clientY - r.top) / U.scale };
  },
  later(ctx, fn, ms) { return ctx ? ctx.later(fn, ms) : setTimeout(fn, ms); },
  // 等待 ms 毫秒；离开页面后 ctx 失效，返回的 Promise 不再结算，后续动画自然中止
  wait(ctx, ms) { return new Promise((r) => (ctx ? ctx.later(r, ms) : setTimeout(r, ms))); },
  // 让 SVG 圆点沿同一个 <svg> 里的 path 走一遍（坐标天然一致）；返回 Promise，可以 await 串成动画序列。
  // o.alive 是可选的中止条件函数（例如检查令牌），返回 false 时立刻停下并隐藏圆点
  fly(dot, path, ms, o = {}) {
    const len = path.getTotalLength(), t0 = performance.now() + (o.delay || 0);
    const ease = o.linear ? (t) => t : (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    return new Promise((res) => {
      const tick = (now) => {
        if ((o.ctx && !o.ctx.alive) || (o.alive && !o.alive())) { dot.style.opacity = 0; res(false); return; }
        const t = Math.min(1, Math.max(0, (now - t0) / ms)), e = ease(t);
        const p = path.getPointAtLength((o.reverse ? 1 - e : e) * len);
        dot.setAttribute('cx', p.x.toFixed(1));
        dot.setAttribute('cy', p.y.toFixed(1));
        dot.style.opacity = t <= 0 ? 0 : t < 0.08 ? t / 0.08 : t > 0.92 && !o.keep ? (1 - t) / 0.08 : 1;
        if (t < 1) requestAnimationFrame(tick);
        else { dot.style.opacity = o.keep ? 1 : 0; res(true); }
      };
      requestAnimationFrame(tick);
    });
  },
  // 重新触发某个 CSS 动画类
  restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); },
  // 把标题拆成单字，配合 .split .ch 做逐字入场；data-grad="#色1,#色2" 给出渐变色，data-off 是起始延迟序号
  splitChars(el) {
    const t = el.textContent.trim(), off = +el.dataset.off || 0, gr = el.dataset.grad;
    const A = gr ? gr.split(',').map((h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }) : null;
    el.innerHTML = [...t].map((c, j) => {
      let col = '';
      if (A) {
        const u = t.length > 1 ? j / (t.length - 1) : 0, seg = u * (A.length - 1), a = Math.min(A.length - 2, Math.floor(seg)), fr = seg - a;
        col = ';color:rgb(' + A[a].map((v, q) => Math.round(v + (A[a + 1][q] - v) * fr)) + ')';
      }
      return `<span class="ch" style="--i:${j + off}${col}">${c === ' ' ? '&nbsp;' : c}</span>`;
    }).join('');
  },
  // 数字格式：dec 小数位，sep 千分位，prefix/suffix 前后缀
  fmt(v, o = {}) {
    const dec = +o.dec || 0;
    const s = o.sep ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec);
    return (o.prefix || '') + s + (o.suffix || '');
  },
  count(el, to, o = {}) {
    const dur = o.dur || 1600, ctx = o.ctx, from = +o.from || 0;
    el.textContent = U.fmt(from, o);
    U.later(ctx, () => {
      const t0 = performance.now();
      const tick = () => {
        if (ctx && !ctx.alive) return;
        const t = Math.min(1, (performance.now() - t0) / dur);
        el.textContent = U.fmt(from + (to - from) * U.ease(t), o);
        if (t < 1) requestAnimationFrame(tick);
      };
      tick();
    }, o.delay || 0);
  },
  type(el, o = {}) {
    const txt = el.dataset.orig ?? el.textContent;
    el.dataset.orig = txt;
    el.textContent = '';
    el.classList.add('typing');
    const sp = o.speed || 40, ctx = o.ctx;
    let i = 0;
    const tick = () => {
      if (ctx && !ctx.alive) return;
      i++;
      el.textContent = txt.slice(0, i);
      if (i < txt.length) U.later(ctx, tick, sp);
      else U.later(ctx, () => { el.classList.remove('typing'); o.done && o.done(); }, 700);
    };
    U.later(ctx, tick, o.delay || 0);
  },
  scramble(el, o = {}) {
    const txt = el.dataset.orig ?? el.textContent;
    el.dataset.orig = txt;
    const cs = '▓▒░<>/{}[]=+*#%&ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    const dur = o.dur || 1200, ctx = o.ctx;
    const rnd = () => [...txt].map((c) => (c === ' ' || c === '\n' ? c : cs[(Math.random() * cs.length) | 0])).join('');
    el.textContent = rnd();
    U.later(ctx, () => {
      const t0 = performance.now();
      const tick = () => {
        if (ctx && !ctx.alive) return;
        const t = Math.min(1, (performance.now() - t0) / dur), n = Math.floor(txt.length * t);
        let s = txt.slice(0, n);
        for (let i = n; i < txt.length; i++) {
          const c = txt[i];
          s += c === ' ' || c === '\n' ? c : cs[(Math.random() * cs.length) | 0];
        }
        el.textContent = s;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = txt;
      };
      tick();
    }, o.delay || 0);
  },
  // 思考题折叠列表：点击题干展开 / 收起（single 为 true 时同时只展开一题）；返回 open(i) 供分步或自动演示调用
  qa(host, o = {}) {
    const items = [...host.querySelectorAll('.qa-it')];
    const open = (i) => items.forEach((it, j) => it.classList.toggle('open', o.single === false ? it.classList.contains('open') || j === i : j === i));
    items.forEach((it, i) => it.querySelector('.qa-q').addEventListener('click', () => {
      if (it.classList.contains('open')) it.classList.remove('open');
      else open(i);
    }));
    return open;
  },
  toast(m) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = m;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 1800);
  },
  copy(text) {
    const ok = () => U.toast('已复制到剪贴板');
    const fb = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { U.toast('复制失败，请手动选择文本'); }
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fb);
    else fb();
  },
  confetti(x, y, n = 150) {
    const cv = document.getElementById('fx'), g = cv.getContext('2d'), d = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * d;
    cv.height = innerHeight * d;
    g.setTransform(d, 0, 0, d, 0, 0);
    const cols = ['#22d3ee', '#a78bfa', '#fbbf24', '#34d399', '#fb7185', '#60a5fa'];
    const ps = Array.from({ length: n }, () => ({
      x, y, vx: (Math.random() - 0.5) * 18, vy: -Math.random() * 17 - 5, r: Math.random() * 7 + 4,
      a: Math.random() * 6.3, va: (Math.random() - 0.5) * 0.4, c: cols[(Math.random() * 6) | 0], l: 1,
    }));
    const tick = () => {
      g.clearRect(0, 0, innerWidth, innerHeight);
      let k = 0;
      for (const p of ps) {
        p.vy += 0.42; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.a += p.va; p.l -= 0.007;
        if (p.l > 0 && p.y < innerHeight + 40) {
          k++;
          g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.globalAlpha = p.l; g.fillStyle = p.c;
          g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore();
        }
      }
      if (k) requestAnimationFrame(tick);
      else g.clearRect(0, 0, innerWidth, innerHeight);
    };
    tick();
  },
  // 分段开关：<div class="seg"><i class="knob"></i><button data-v="a">…</button>…</div>
  seg(host, onPick) {
    const knob = host.querySelector('.knob'), bs = [...host.querySelectorAll('button')];
    const set = (v) => {
      bs.forEach((b) => b.classList.toggle('on', b.dataset.v === v));
      const b = bs.find((x) => x.dataset.v === v);
      if (b && knob) { knob.style.left = b.offsetLeft + 'px'; knob.style.width = b.offsetWidth + 'px'; }
    };
    bs.forEach((b) => b.addEventListener('click', () => { set(b.dataset.v); onPick && onPick(b.dataset.v, true); }));
    return set;
  },

  // 环形图：nodes = [{label, color}]；active 高亮第几个；center(c, S) 返回中心 SVG
  ring(host, o = {}) {
    const id = 'rg' + ++U._id, S = o.size || 640, c = S / 2, R = o.r || S * 0.34, nr = o.nodeR || S * 0.056;
    const st = o.nodes || [], N = st.length;
    const A = (i) => ((-90 + (i * 360) / N) * Math.PI) / 180;
    const P = (i, r = R) => [c + r * Math.cos(A(i)), c + r * Math.sin(A(i))];
    const gap = (nr + 9) / R, f = (n) => n.toFixed(1);
    let h = `<svg class="loop-svg" viewBox="0 0 ${S} ${S}"><defs><filter id="${id}g" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${f(S / 120)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
    h += `<circle class="ring r1" cx="${c}" cy="${c}" r="${f(R + nr + S * 0.05)}"/><circle class="ring r2" cx="${c}" cy="${c}" r="${f(R - nr - S * 0.045)}"/>`;
    for (let i = 0; i < N; i++) {
      const a1 = A(i) + gap, a2 = A(i + 1) - gap;
      const d = `M${f(c + R * Math.cos(a1))} ${f(c + R * Math.sin(a1))}A${R} ${R} 0 0 1 ${f(c + R * Math.cos(a2))} ${f(c + R * Math.sin(a2))}`;
      h += `<path class="arc" d="${d}" style="--c:${st[i].color};--len:${f(R * (a2 - a1))};--i:${i}"/><path class="arc-flow" d="${d}" style="--c:${st[i].color}"/>`;
    }
    if (o.comet !== false) {
      const cp = `M${c} ${c - R}A${R} ${R} 0 1 1 ${c - 0.01} ${c - R}`;
      [[1, 0], [0.75, -0.08], [0.5, -0.16], [0.3, -0.24]].forEach(([k, b]) => {
        h += `<circle class="comet" r="${f((S / 160) * k + 1.2)}" fill-opacity="${k}" filter="url(#${id}g)"><animateMotion dur="${o.cometDur || 9}s" begin="${b}s" repeatCount="indefinite" path="${cp}"/></circle>`;
      });
    }
    if (o.center) h += o.center(c, S);
    for (let i = 0; i < N; i++) {
      const [x, y] = P(i), on = o.active === i, dm = o.active != null && o.active >= 0 && !on;
      const num = st[i].num ?? String(i + 1).padStart(2, '0');
      h += `<g class="node${on ? ' on' : ''}${dm ? ' dim' : ''}" data-i="${i}" style="--c:${st[i].color};--i:${i}" transform="translate(${f(x)} ${f(y)})"><g class="node-in"><circle class="halo" r="${nr}"/><circle class="core" r="${nr}"/><text class="num" style="font-size:${f(nr * 0.62)}px">${num}</text></g></g>`;
      if (o.labels !== false) {
        const [lx, ly] = P(i, R + nr + (o.labelGap || S * 0.055)), co = Math.cos(A(i));
        const an = co > 0.25 ? 'start' : co < -0.25 ? 'end' : 'middle';
        h += `<text class="lab${on ? ' on' : ''}${dm ? ' dim' : ''}" data-i="${i}" x="${f(lx)}" y="${f(ly)}" text-anchor="${an}" style="--c:${st[i].color};--i:${i};font-size:${f(o.labelSize || S * 0.036)}px">${st[i].label}</text>`;
      }
    }
    host.innerHTML = h + '</svg>';
    return host.querySelector('svg');
  },

  // 轨道图（封面）：中心核心 + 若干条倾斜椭圆轨道上的卫星，卫星标签始终保持水平
  orbit(host, o = {}) {
    const id = 'ob' + ++U._id, S = o.size || 700, c = S / 2, f = (n) => n.toFixed(1);
    let h = `<svg class="orbit-svg" viewBox="0 0 ${S} ${S}"><defs>
      <radialGradient id="${id}c"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${o.coreColor || '#a5f3fc'}"/><stop offset="1" stop-color="${o.coreColor || '#22d3ee'}" stop-opacity="0"/></radialGradient>
      <filter id="${id}g" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${f(S / 110)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
    if (o.outer) {
      h += `<circle class="ob-outer" cx="${c}" cy="${c}" r="${f(S * 0.47)}"/>`;
      h += `<path id="${id}t" d="M${f(c - S * 0.47)} ${c}A${f(S * 0.47)} ${f(S * 0.47)} 0 0 1 ${f(c + S * 0.47)} ${c}" fill="none"/>`;
      h += `<text class="ob-outer-t"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${o.outer}</textPath></text>`;
    }
    (o.sats || []).forEach((s, i) => {
      const rx = s.rx * S, ry = s.ry * S, t = ((s.tilt || 0) * Math.PI) / 180;
      const x1 = c - rx * Math.cos(t), y1 = c - rx * Math.sin(t), x2 = c + rx * Math.cos(t), y2 = c + rx * Math.sin(t);
      const d = `M${f(x1)} ${f(y1)}A${f(rx)} ${f(ry)} ${s.tilt || 0} 1 1 ${f(x2)} ${f(y2)}A${f(rx)} ${f(ry)} ${s.tilt || 0} 1 1 ${f(x1)} ${f(y1)}`;
      h += `<path id="${id}p${i}" class="ob-path" d="${d}" style="--c:${s.color}"/>`;
      h += `<g class="ob-sat" style="--c:${s.color}"><circle class="ob-glow" r="${f(S * 0.05)}" filter="url(#${id}g)"/><circle class="ob-dot" r="${f(S * 0.034)}"/><text class="ob-lab" y="${f(S * 0.075)}">${s.label}</text>`;
      h += `<animateMotion dur="${s.dur || 12}s" begin="${-(s.phase || 0) * (s.dur || 12)}s" repeatCount="indefinite"><mpath href="#${id}p${i}"/></animateMotion></g>`;
    });
    h += `<circle class="ob-halo" cx="${c}" cy="${c}" r="${f(S * 0.16)}" fill="url(#${id}c)"/>`;
    h += `<circle class="ob-core" cx="${c}" cy="${c}" r="${f(S * 0.09)}"/>`;
    h += `<circle class="ob-wave" cx="${c}" cy="${c}" r="${f(S * 0.09)}"/><circle class="ob-wave w2" cx="${c}" cy="${c}" r="${f(S * 0.09)}"/>`;
    h += `<text class="ob-core-t" x="${c}" y="${c}">${o.core || 'Agent'}</text>`;
    host.innerHTML = h + '</svg>';
    return host.querySelector('svg');
  },

  // 背景粒子网络：color(a, b) 渐变到新的强调色，warp(v) 触发一次曲速效果
  background(cv) {
    const g = cv.getContext('2d');
    let W, Hh, pts = [], warp = 0, mx = 0, my = 0, cx = 0, cy = 0;
    const col = [34, 211, 238], col2 = [167, 139, 250];
    let tg = [34, 211, 238], tg2 = [167, 139, 250];
    const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const mk = () => ({ x: Math.random() * W, y: Math.random() * Hh, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, z: Math.random() * 0.8 + 0.2, r: Math.random() * 1.6 + 0.5 });
    function rs() {
      const d = Math.min(2, devicePixelRatio || 1);
      W = innerWidth; Hh = innerHeight;
      cv.width = W * d; cv.height = Hh * d;
      g.setTransform(d, 0, 0, d, 0, 0);
      pts = Array.from({ length: Math.round(Math.min(130, (W * Hh) / 15000)) }, mk);
    }
    function frame() {
      requestAnimationFrame(frame);
      if (document.hidden) return;
      g.clearRect(0, 0, W, Hh);
      for (let i = 0; i < 3; i++) { col[i] += (tg[i] - col[i]) * 0.04; col2[i] += (tg2[i] - col2[i]) * 0.04; }
      warp *= 0.955; cx += (mx - cx) * 0.05; cy += (my - cy) * 0.05;
      const ox = W / 2, oy = Hh / 2, c1 = `rgba(${col.map(Math.round)},`, c2 = `rgba(${col2.map(Math.round)},`;
      for (const p of pts) {
        p.px = p.x; p.py = p.y; p.x += p.vx * p.z; p.y += p.vy * p.z;
        if (warp > 0.02) { const dx = p.x - ox, dy = p.y - oy, d = Math.hypot(dx, dy) || 1, s = warp * 24 * p.z; p.x += (dx / d) * s; p.y += (dy / d) * s; }
        if (p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > Hh + 30) {
          if (warp > 0.1) { p.x = ox + (Math.random() - 0.5) * W * 0.35; p.y = oy + (Math.random() - 0.5) * Hh * 0.35; }
          else { p.x = ((p.x + W + 60) % (W + 60)) - 30; p.y = ((p.y + Hh + 60) % (Hh + 60)) - 30; }
          p.px = p.x; p.py = p.y;
        }
      }
      if (warp < 0.45) {
        const L2 = 140 * 140;
        g.lineWidth = 1;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
            if (d2 < L2) {
              g.strokeStyle = c1 + ((1 - d2 / L2) * 0.17 * (1 - warp * 2)).toFixed(3) + ')';
              g.beginPath(); g.moveTo(a.x + cx * a.z, a.y + cy * a.z); g.lineTo(b.x + cx * b.z, b.y + cy * b.z); g.stroke();
            }
          }
        }
      }
      for (const p of pts) {
        const x = p.x + cx * p.z, y = p.y + cy * p.z;
        if (warp > 0.05) {
          g.strokeStyle = c2 + (0.25 + 0.55 * p.z).toFixed(2) + ')';
          g.lineWidth = p.r * p.z * 1.5;
          g.beginPath(); g.moveTo(p.px + cx * p.z, p.py + cy * p.z); g.lineTo(x, y); g.stroke();
        }
        g.fillStyle = c1 + (0.35 + 0.5 * p.z).toFixed(2) + ')';
        g.beginPath(); g.arc(x, y, p.r * p.z + 0.3, 0, 6.283); g.fill();
      }
    }
    addEventListener('resize', rs);
    addEventListener('mousemove', (e) => { mx = (e.clientX / innerWidth - 0.5) * -34; my = (e.clientY / innerHeight - 0.5) * -34; });
    rs();
    requestAnimationFrame(frame);
    return {
      color(a, b) { tg = hex(a); tg2 = hex(b); },
      warp(v) { if (!U.reduced) warp = Math.max(warp, v); },
    };
  },
};
