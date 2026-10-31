/* 演示引擎 · 运行时（页面末尾加载）
 * 翻页与分步、页面生命周期、过渡特效、HUD、目录、讲稿、自动播放、快捷键。
 * 每章的配置来自 window.DECK_CFG（见各章 chapter.json）。
 * 页面属性：data-part 所属部分，data-steps 步数，data-trans 过渡方式，data-title 标题，data-notes 讲解，data-dur 自动播放时每步停留毫秒数。
 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.DECK_CFG || {};
  const PARTS = CFG.parts && CFG.parts.length ? CFG.parts : [{ n: '', k: '', acc: '#22d3ee', acc2: '#a78bfa' }];
  const deck = $('#deck'), slides = $$('.slide', deck), H = window.HOOKS;
  const reduced = U.reduced;
  const AUTO_MS = CFG.autoMs || 9000;
  const BG = U.background($('#bg'));
  const sweep = $('#sweep');

  /* ---------- 过渡特效：每种都有入场和离场两段，dir 为翻页方向 ---------- */
  const P3 = 'perspective(2400px)';
  const TR = {
    slide: (d) => ({
      in: [{ opacity: 0, transform: `translateX(${d * 140}px) scale(1.02)`, filter: 'blur(12px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }],
      out: [{ opacity: 1, transform: 'none', filter: 'blur(0px)' }, { opacity: 0, transform: `translateX(${-d * 110}px) scale(.97)`, filter: 'blur(12px)' }],
      dIn: 820, dOut: 540,
    }),
    zoom: (d) => ({
      in: [{ opacity: 0, transform: `scale(${d > 0 ? 0.8 : 1.18})`, filter: 'blur(16px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }],
      out: [{ opacity: 1, transform: 'none', filter: 'blur(0px)' }, { opacity: 0, transform: `scale(${d > 0 ? 1.18 : 0.8})`, filter: 'blur(16px)' }],
      dIn: 900, dOut: 560,
    }),
    flip: (d) => ({
      in: [{ opacity: 0, transform: `${P3} rotateY(${-d * 58}deg) translateZ(-260px)`, filter: 'blur(6px)' }, { opacity: 1, transform: `${P3} rotateY(0deg) translateZ(0px)`, filter: 'blur(0px)' }],
      out: [{ opacity: 1, transform: `${P3} rotateY(0deg) translateZ(0px)`, filter: 'blur(0px)' }, { opacity: 0, transform: `${P3} rotateY(${d * 58}deg) translateZ(-260px)`, filter: 'blur(6px)' }],
      dIn: 1000, dOut: 620,
    }),
    rise: (d) => ({
      in: [{ opacity: 0, transform: `translateY(${d * 130}px) scale(.98)`, filter: 'blur(10px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }],
      out: [{ opacity: 1, transform: 'none', filter: 'blur(0px)' }, { opacity: 0, transform: `translateY(${-d * 90}px) scale(.98)`, filter: 'blur(10px)' }],
      dIn: 860, dOut: 520,
    }),
    iris: () => ({
      in: [{ clipPath: 'circle(0% at 50% 50%)', filter: 'brightness(1.8)' }, { clipPath: 'circle(76% at 50% 50%)', filter: 'brightness(1)' }],
      out: [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }],
      dIn: 1050, dOut: 760, ease: 'cubic-bezier(.65,0,.35,1)',
    }),
    warp: () => ({
      in: [{ opacity: 0, transform: 'scale(.84)', filter: 'blur(18px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }],
      out: [{ opacity: 1, transform: 'none', filter: 'blur(0px)' }, { opacity: 0, transform: 'scale(1.14)', filter: 'blur(12px)' }],
      dIn: 1100, dOut: 540, delay: 160,
    }),
  };
  const transOf = (s) => (TR[s.dataset.trans] ? s.dataset.trans : s.classList.contains('chapter') ? 'warp' : 'slide');

  /* ---------- 初始化 ---------- */
  const numOpts = (el) => ({ dec: +el.dataset.dec || 0, sep: el.dataset.sep !== undefined, prefix: el.dataset.prefix || '', suffix: el.dataset.suffix || '' });
  const ringNodes = PARTS.slice(1).map((p) => ({ label: p.short || p.n, color: p.acc }));

  slides.forEach((s, i) => {
    s.dataset.i = i;
    s._p = Math.min(PARTS.length - 1, +s.dataset.part || 0);
    const st = $$('[data-step]', s).map((e) => +e.dataset.step);
    s._steps = Math.max(st.length ? Math.max(...st) : 0, +s.dataset.steps || 0);
    const k = $('.kicker:empty', s);
    if (k) { const p = PARTS[s._p]; k.textContent = (p.k ? p.k + ' · ' : '') + p.n; }
    $$('[data-count]', s).forEach((e) => (e.textContent = U.fmt(0, numOpts(e))));
    $$('[data-type]', s).forEach((e) => { e.dataset.orig = e.textContent; e.textContent = ''; });
    $$('[data-scramble]', s).forEach((e) => (e.dataset.orig = e.textContent));
    $$('.split', s).forEach(U.splitChars);
    $$('.ch-loop', s).forEach((h) => U.ring(h, {
      size: 660, nodes: ringNodes, active: +h.dataset.node, cometDur: 10,
      center: (c) => `<text class="big" x="${c}" y="${c}" style="font-size:150px">${h.dataset.num || ''}</text>`,
    }));
  });
  slides.forEach((s) => { try { H[s.id]?.init?.(s); } catch (e) { console.error(s.id, e); } });
  // 未显示的页面先暂停 SVG 动画，进入时再恢复，避免几十页同时在后台跑动画
  slides.forEach((s) => $$('svg', s).forEach((v) => v.pauseAnimations && v.pauseAnimations()));

  /* ---------- 生命周期 ---------- */
  function makeCtx(slide) {
    const T = new Set(), I = new Set(), F = new Set(), C = [];
    let alive = true;
    return {
      slide,
      get alive() { return alive; },
      later(fn, ms) { const id = setTimeout(() => { T.delete(id); if (alive) fn(); }, ms); T.add(id); return id; },
      every(fn, ms) { const id = setInterval(() => { if (alive) fn(); }, ms); I.add(id); return id; },
      raf(fn) {
        const h = {};
        const loop = (t) => { if (!alive) return; if (fn(t) === false) return; h.id = requestAnimationFrame(loop); };
        h.id = requestAnimationFrame(loop);
        F.add(h);
        return h;
      },
      stop(id) { clearTimeout(id); clearInterval(id); },
      onCleanup(fn) { C.push(fn); },
      dispose() {
        alive = false;
        T.forEach(clearTimeout); I.forEach(clearInterval); F.forEach((h) => cancelAnimationFrame(h.id));
        C.forEach((fn) => { try { fn(); } catch (e) { /* 清理失败不影响翻页 */ } });
      },
    };
  }

  let cur = -1, step = 0, ctx = null, lastP = -1;
  const applySteps = (s, k) => $$('[data-step]', s).forEach((e) => e.classList.toggle('on', +e.dataset.step <= k));
  function shown(el, s) {
    for (let n = el; n && n !== s; n = n.parentElement) {
      if (n.dataset && n.dataset.step !== undefined && !n.classList.contains('on')) return false;
    }
    return true;
  }
  function runAuto(s, c) {
    $$('[data-count]', s).forEach((el) => {
      if (el._done || !shown(el, s)) return;
      el._done = 1;
      U.count(el, +el.dataset.count, { ...numOpts(el), dur: +el.dataset.dur || 1600, delay: +(el.dataset.delay || 350), ctx: c });
    });
    $$('[data-type]', s).forEach((el) => {
      if (el._done || !shown(el, s)) return;
      el._done = 1;
      U.type(el, { ctx: c, speed: +el.dataset.speed || 38, delay: +(el.dataset.delay || 400) });
    });
    $$('[data-scramble]', s).forEach((el) => {
      if (el._done || !shown(el, s)) return;
      el._done = 1;
      U.scramble(el, { ctx: c, dur: +el.dataset.dur || 1200, delay: +(el.dataset.delay || 250) });
    });
  }
  function resetAuto(s) {
    $$('[data-count]', s).forEach((el) => { el._done = 0; el.textContent = U.fmt(0, numOpts(el)); });
    $$('[data-type]', s).forEach((el) => { el._done = 0; el.textContent = ''; el.classList.remove('typing'); });
    $$('[data-scramble]', s).forEach((el) => { el._done = 0; el.textContent = el.dataset.orig; });
  }
  function doSweep() {
    if (reduced || !sweep) return;
    sweep.animate([
      { transform: 'translateX(-40vw) skewX(-16deg)', opacity: 0 },
      { opacity: 1, offset: 0.35 },
      { transform: 'translateX(120vw) skewX(-16deg)', opacity: 0 },
    ], { duration: 1250, easing: 'cubic-bezier(.7,0,.3,1)' });
  }
  function setPart(p, force) {
    const c = PARTS[p];
    document.body.style.setProperty('--acc', c.acc);
    document.body.style.setProperty('--acc2', c.acc2);
    BG.color(c.acc, c.acc2);
    if (lastP >= 0 && (p !== lastP || force)) { BG.warp(p !== lastP ? 1 : 0.7); if (p !== lastP) doSweep(); }
    lastP = p;
  }
  function enter(s, k, dir, first) {
    s.getAnimations().forEach((a) => a.cancel());
    s.classList.remove('leaving', 'no-trans');
    applySteps(s, k);
    s.classList.add('active');
    const kind = transOf(s);
    if (!first && !reduced) {
      const t = TR[kind](dir);
      s.animate(t.in, { duration: t.dIn, easing: t.ease || 'cubic-bezier(.2,.8,.2,1)', delay: t.delay ?? 80, fill: 'backwards' });
    }
    setPart(s._p, kind === 'warp');
    $$('svg', s).forEach((v) => v.unpauseAnimations && v.unpauseAnimations());
    ctx = makeCtx(s);
    try { H[s.id]?.enter?.(s, ctx, k, dir); } catch (e) { console.error(s.id, e); }
    runAuto(s, ctx);
  }
  function leave(s, dir, kind) {
    try { H[s.id]?.leave?.(s); } catch (e) { console.error(s.id, e); }
    ctx && ctx.dispose();
    ctx = null;
    s.getAnimations().forEach((a) => a.cancel());
    s.classList.add('leaving');
    const t = TR[kind](dir);
    const a = s.animate(t.out, { duration: reduced ? 1 : t.dOut, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
    a.onfinish = () => {
      s.classList.add('no-trans');
      s.classList.remove('active', 'leaving');
      applySteps(s, -1);
      resetAuto(s);
      try { H[s.id]?.reset?.(s); } catch (e) { console.error(s.id, e); }
      void s.offsetWidth;
      s.classList.remove('no-trans');
      a.cancel();
      $$('svg', s).forEach((v) => v.pauseAnimations && v.pauseAnimations());
    };
  }
  function go(n, k = 0, dir) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    const s = slides[n];
    k = Math.max(0, Math.min(s._steps, k));
    if (n === cur) { if (k !== step) setStep(k, k > step ? 1 : -1); return; }
    dir = dir ?? (n > cur ? 1 : -1);
    const from = cur >= 0 ? slides[cur] : null;
    if (from) leave(from, dir, transOf(s));
    cur = n;
    step = k;
    enter(s, k, dir, !from);
    hud();
  }
  function setStep(k, dir) {
    const s = slides[cur];
    step = k;
    applySteps(s, k);
    runAuto(s, ctx);
    try { H[s.id]?.step?.(s, ctx, k, dir); } catch (e) { console.error(s.id, e); }
    hud();
  }
  function next() {
    const s = slides[cur];
    if (step < s._steps) setStep(step + 1, 1);
    else if (cur < slides.length - 1) go(cur + 1, 0, 1);
    else { U.toast(CFG.next && CFG.next.ready ? '本章结束 · 可在最后一页进入下一章' : '本章结束'); setAuto(false); }
  }
  function prev() {
    if (step > 0) setStep(step - 1, -1);
    else if (cur > 0) go(cur - 1, slides[cur - 1]._steps, -1);
  }
  window.DECK = { go, next, prev, get cur() { return cur; }, get step() { return step; } };

  /* ---------- 自动播放：每步停留 data-dur 毫秒（默认 AUTO_MS），翻到最后自动停止 ---------- */
  const autoBtn = $('#autobtn');
  let auto = false, autoT = 0;
  function schedule() {
    clearTimeout(autoT);
    if (!auto || cur < 0) return;
    const ms = +(slides[cur].dataset.dur || 0) || AUTO_MS;
    if (autoBtn) { autoBtn.style.setProperty('--ms', ms + 'ms'); U.restart(autoBtn, 'tick'); }
    autoT = setTimeout(() => {
      if (isOpen()) { schedule(); return; }
      next();
    }, ms);
  }
  function setAuto(v) {
    if (v === auto) return;
    auto = v;
    document.body.classList.toggle('autoplay', v);
    if (!v && autoBtn) autoBtn.classList.remove('tick');
    if (v) schedule(); else clearTimeout(autoT);
    U.toast(v ? '自动播放：开（再按 P 关闭）' : '自动播放：关');
  }
  // 在页面里点按交互时，重新计时，给观看者留出时间
  deck.addEventListener('pointerdown', () => { if (auto) schedule(); });

  /* ---------- HUD / 目录 / 讲解 ---------- */
  const rail = $('#rail');
  PARTS.forEach((c, i) => {
    const f = slides.findIndex((s) => s._p === i);
    if (f < 0) return;
    const b = document.createElement('button');
    b.dataset.p = i;
    b.innerHTML = `<span>${c.k ? c.k + ' ' : ''}${c.n}</span>`;
    b.onclick = () => go(f, 0);
    rail.appendChild(b);
  });
  function hud() {
    const s = slides[cur], c = PARTS[s._p];
    $('#hud-p').innerHTML = `<b>${c.k || ''}</b><span>${c.n}</span>`;
    $('#count').textContent = `${cur + 1} / ${slides.length}`;
    $('#progress').style.width = Math.min(100, ((cur + (s._steps ? step / (s._steps + 1) : 0)) / Math.max(1, slides.length - 1)) * 100) + '%';
    $$('#rail button').forEach((b) => { const i = +b.dataset.p; b.classList.toggle('cur', i === s._p); b.classList.toggle('done', i < s._p); });
    $('#notes-t').textContent = s.dataset.title || '';
    $('#notes-b').innerHTML = s.dataset.notes || '（本页无讲解）';
    history.replaceState(null, '', '#/' + (cur + 1) + (step ? '/' + step : ''));
    // 记下观看位置，总目录据此显示“继续观看”；本地文件打开时浏览器可能禁用存储，失败就忽略
    try {
      localStorage.setItem('aab-last', JSON.stringify({ id: CFG.id, no: CFG.no, title: CFG.title, page: cur + 1, step, total: slides.length, slide: s.dataset.title || '' }));
    } catch (e) { /* 无法记录时不影响播放 */ }
    schedule();
  }
  const ovGrid = $('#ov-grid');
  ovGrid.innerHTML = PARTS.map((c, pi) => {
    const it = slides.filter((s) => s._p === pi);
    if (!it.length) return '';
    return `<div class="ov-ch" style="--c:${c.acc}"><div class="ov-h"><b>${c.k || ''}</b>${c.n}</div>${it.map((s) => `<button data-go="${s.dataset.i}"><span>${+s.dataset.i + 1}</span>${s.dataset.title || ''}</button>`).join('')}</div>`;
  }).join('');
  ovGrid.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) { closeAll(); go(+b.dataset.go, 0); } });
  const ovs = ['#overview', '#help'].map((q) => $(q));
  const isOpen = () => ovs.some((o) => o.classList.contains('show'));
  function closeAll() { ovs.forEach((o) => o.classList.remove('show')); }
  function toggle(el) {
    const was = el.classList.contains('show');
    closeAll();
    if (!was) {
      el.classList.add('show');
      if (el.id === 'overview') $$('#ov-grid button').forEach((b) => b.classList.toggle('cur', +b.dataset.go === cur));
    }
  }
  ovs.forEach((o) => o.addEventListener('click', (e) => { if (e.target === o) closeAll(); }));
  const notes = $('#notes');
  function full() { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
  $('#hud').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    ({
      prev, next, full,
      auto: () => setAuto(!auto),
      overview: () => toggle($('#overview')),
      help: () => toggle($('#help')),
      notes: () => notes.classList.toggle('show'),
    })[b.dataset.act]();
  });

  /* ---------- 离开本页（回总目录 / 去下一章）：从点击处展开的圆形转场 ---------- */
  // 章末导航：<a data-nav="next|prev|hub"><span data-nav-label></span></a>，链接和文字从本章配置里取
  $$('[data-nav]').forEach((a) => {
    const t = a.dataset.nav, c = t === 'hub' ? { href: 'index.html', ready: true } : CFG[t];
    if (!c) { a.remove(); return; }
    a.setAttribute('href', c.href);
    const label = a.querySelector('[data-nav-label]');
    if (label && t !== 'hub') label.textContent = `${t === 'next' ? '下一章' : '上一章'}：${c.no} · ${c.title}`;
    if (c.ready) a.setAttribute('data-leave', '');
    else {
      a.classList.add('soon');
      a.addEventListener('click', (e) => { e.preventDefault(); U.toast(`${c.no} · ${c.title}：制作中`); });
    }
  });
  const mask = $('#leaveMask');
  function leaveTo(href, e) {
    if (!href) return;
    if (reduced || !mask) { location.href = href; return; }
    mask.style.setProperty('--mx', (e ? e.clientX : innerWidth / 2) + 'px');
    mask.style.setProperty('--my', (e ? e.clientY : innerHeight / 2) + 'px');
    mask.classList.add('go');
    BG.warp(1.2);
    setTimeout(() => { location.href = href; }, 720);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-leave]');
    if (!a) return;
    e.preventDefault();
    leaveTo(a.getAttribute('href'), e);
  });
  // 从其他页面返回时（浏览器后退缓存），收起转场遮罩
  addEventListener('pageshow', () => mask && mask.classList.remove('go'));

  /* ---------- 输入 ---------- */
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === 'Escape') { isOpen() ? closeAll() : toggle($('#overview')); return; }
    if (/^[oO]$/.test(k)) return toggle($('#overview'));
    if (/^[hH?]$/.test(k)) return toggle($('#help'));
    if (/^[nN]$/.test(k)) return notes.classList.toggle('show');
    if (/^[fF]$/.test(k)) return full();
    if (/^[pP]$/.test(k)) return setAuto(!auto);
    if (isOpen()) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (/^[0-9]$/.test(k)) { const f = slides.findIndex((s) => s._p === +k); if (f >= 0) go(f, 0); }
  });
  let wt = 0;
  addEventListener('wheel', (e) => {
    if (isOpen() || e.target.closest('.scroll,#notes')) return;
    const t = Date.now();
    if (t - wt < 850 || Math.abs(e.deltaY) < 20) return;
    wt = t;
    e.deltaY > 0 ? next() : prev();
  }, { passive: true });
  let tx = 0, ty = 0;
  addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
  }, { passive: true });
  let it;
  function wake() {
    document.body.classList.remove('idle');
    clearTimeout(it);
    it = setTimeout(() => { if (!isOpen() && !notes.classList.contains('show')) document.body.classList.add('idle'); }, 2800);
  }
  addEventListener('mousemove', wake);
  wake();
  function fit() {
    U.scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    deck.style.transform = `translate(-50%,-50%) scale(${U.scale})`;
  }
  addEventListener('resize', fit);
  fit();

  /* ---------- 启动：支持 #/页码/步骤 直达 ---------- */
  const m = location.hash.match(/#\/(\d+)(?:\/(\d+))?/);
  go(m ? +m[1] - 1 : 0, m && m[2] ? +m[2] : 0, 1);
})();
