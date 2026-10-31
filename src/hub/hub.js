/* 总目录页：章节卡片、3D 倾斜与追光、键盘选择、继续观看、跳转转场 */
(() => {
  'use strict';
  const B = window.BOOK;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const deck = $('#deck'), page = $('.hub-page'), grid = $('.hb-grid');
  const BG = U.background($('#bg'));
  const BASE = ['#22d3ee', '#a78bfa'];

  function fit() {
    U.scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    deck.style.transform = `translate(-50%,-50%) scale(${U.scale})`;
  }
  addEventListener('resize', fit);
  fit();

  $$('.split', page).forEach(U.splitChars);
  U.orbit($('.hb-orbit'), {
    size: 430, core: 'Agent', outer: 'ENVIRONMENT · 环境',
    sats: [
      { label: 'LLM', color: '#a78bfa', rx: 0.36, ry: 0.15, tilt: -24, dur: 11, phase: 0 },
      { label: '上下文', color: '#22d3ee', rx: 0.33, ry: 0.13, tilt: 34, dur: 14, phase: 0.35 },
      { label: '工具', color: '#fbbf24', rx: 0.3, ry: 0.2, tilt: 88, dur: 9, phase: 0.7 },
    ],
  });

  /* ---------- 章节卡片 ---------- */
  const tagOf = (c) => (c.part === 0 ? '构建' : c.part === 1 ? '提升' : c.no === '引言' ? '导读' : '收束');
  const bigOf = (c) => (/^第/.test(c.no) ? String(B.chapters.indexOf(c)).padStart(2, '0') : c.no === '引言' ? '00' : 'Fin');
  grid.innerHTML = B.chapters.map((c, i) => `
    <a class="hc ${c.ready ? 'ready' : 'soon'} fx fx-pop" style="--c:${c.color};--d:${10 + i}" href="${c.ready ? c.id + '.html' : '#'}" data-i="${i}">
      <div class="hc-in">
        <div class="hc-spot"></div>
        <span class="hc-big">${bigOf(c)}</span>
        <span class="hc-st">${c.ready ? '▶ 可播放' : '制作中'}</span>
        <div class="hc-orb"><svg class="ic"><use href="#i-${c.icon}"/></svg></div>
        <div class="hc-body"><div class="hc-no">${c.no}</div><b class="hc-t">${c.title}</b><p class="hc-s">${c.sub}</p></div>
        <span class="hc-tag">${tagOf(c)}</span>
      </div>
    </a>`).join('');
  const cards = $$('.hc', grid);

  $('.hb-parts').innerHTML = B.movements.map((m) => `<span style="--c:${m.color}"><i></i>${m.name}（${m.range}）</span>`).join('');
  const nReady = B.chapters.filter((c) => c.ready).length;
  U.count($('[data-v=ready]'), nReady, { dur: 1200, delay: 1400 });
  U.count($('[data-v=all]'), B.chapters.length, { dur: 1400, delay: 1500 });

  /* ---------- 继续观看 ---------- */
  try {
    const last = JSON.parse(localStorage.getItem('aab-last') || 'null');
    const ch = last && B.chapters.find((c) => c.id === last.id && c.ready);
    if (ch) {
      const a = $('.hb-resume');
      a.href = `${ch.id}.html#/${last.page}${last.step ? '/' + last.step : ''}`;
      a.querySelector('span').textContent = `继续观看 · ${ch.no} 第 ${last.page} 页${last.slide ? '：' + last.slide : ''}`;
      a.hidden = false;
    }
  } catch (e) { /* 浏览器禁用本地存储时不显示 */ }

  /* ---------- 选中、倾斜、追光 ---------- */
  let sel = -1;
  function select(i) {
    sel = i;
    cards.forEach((c, j) => c.classList.toggle('sel', j === i));
    const c = B.chapters[i];
    if (c) {
      document.body.style.setProperty('--acc', c.color);
      BG.color(c.color, c.part === 1 ? '#22d3ee' : '#a78bfa');
    }
  }
  function unselect() {
    sel = -1;
    cards.forEach((c) => c.classList.remove('sel'));
    document.body.style.setProperty('--acc', BASE[0]);
    BG.color(BASE[0], BASE[1]);
  }
  cards.forEach((card, i) => {
    const inner = card.querySelector('.hc-in');
    card.addEventListener('mouseenter', () => select(i));
    card.addEventListener('mousemove', (e) => {
      const r = inner.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      inner.style.setProperty('--mx', px * 100 + '%');
      inner.style.setProperty('--my', py * 100 + '%');
      if (!U.reduced) inner.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { inner.style.transform = ''; unselect(); });
    card.addEventListener('click', (e) => { e.preventDefault(); open(i, e); });
  });

  /* ---------- 打开章节：未完成的章节抖一下并提示 ---------- */
  const mask = $('#leaveMask');
  function leaveTo(href, x, y) {
    if (U.reduced) { location.href = href; return; }
    mask.style.setProperty('--mx', x + 'px');
    mask.style.setProperty('--my', y + 'px');
    mask.classList.add('go');
    BG.warp(1.3);
    setTimeout(() => { location.href = href; }, 720);
  }
  function open(i, e) {
    const c = B.chapters[i], card = cards[i];
    if (!c.ready) {
      U.restart(card, 'shake');
      U.toast(`${c.no} · ${c.title}：制作中`);
      return;
    }
    U.restart(card, 'go');
    const r = card.getBoundingClientRect();
    leaveTo(card.getAttribute('href'), e && e.clientX ? e.clientX : r.left + r.width / 2, e && e.clientY ? e.clientY : r.top + r.height / 2);
  }
  $('.hb-resume').addEventListener('click', (e) => { e.preventDefault(); leaveTo(e.currentTarget.getAttribute('href'), e.clientX, e.clientY); });
  addEventListener('pageshow', () => mask.classList.remove('go'));

  /* ---------- 键盘 ---------- */
  const COLS = 4;
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key, n = cards.length;
    const start = sel < 0 ? B.chapters.findIndex((c) => c.ready) : sel;
    let to = -1;
    if (k === 'ArrowRight') to = sel < 0 ? start : (sel + 1) % n;
    else if (k === 'ArrowLeft') to = sel < 0 ? start : (sel - 1 + n) % n;
    else if (k === 'ArrowDown') to = sel < 0 ? start : Math.min(n - 1, sel + COLS);
    else if (k === 'ArrowUp') to = sel < 0 ? start : Math.max(0, sel - COLS);
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); open(sel < 0 ? start : sel); return; }
    else if (/^[fF]$/.test(k)) { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); return; }
    if (to >= 0) { e.preventDefault(); select(to); }
  });

  // 等两帧再激活页面，让入场动画从初始状态开始
  requestAnimationFrame(() => requestAnimationFrame(() => page.classList.add('active')));
})();
