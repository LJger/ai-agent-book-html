/*
 * 场景 1-0：第一章开场
 * 对应原书第一章开篇两段与「阅读提示」。
 */
AB.registerScene({
  id: 'ch1-0',
  chapter: '第一章 AI Agent 入门',
  title: '本章开场：你已经在使用 AI Agent 了',
  source: '对应原书：第一章 开篇 ·「阅读提示」',

  setup(L, k) {
    const C = k.C;
    const r = {};

    // ── 章节标题（整个场景常驻）──
    r.kicker = k.text(L, 800, 112, '第 一 章', { size: 26, weight: 600, fill: C.sub, anchor: 'middle' });
    r.title = k.text(L, 800, 178, 'AI Agent 入门', { size: 64, weight: 700, anchor: 'middle' });
    k.hide([r.kicker, r.title], { dy: 16 });

    // ── 第 1 步：五个已经在用的 Agent 产品 ──
    const products = [
      ['Cursor', ['搜索代码库', '编辑多个文件', '运行测试直到通过']],
      ['Deep Research', ['反复搜索、阅读', '总结出完整报告']],
      ['Manus', ['操控浏览器', '完成在线任务']],
      ['豆包手机助手', ['在手机上订票', '发消息']],
      ['Pine AI', ['打电话给运营商', '协商降低账单']],
    ];
    r.products = products.map(([name, lines], i) => {
      const x = 70 + i * 296;
      const y = 280;
      const card = k.g(L);
      k.rect(card, x, y, 276, 250, { rx: 16, stroke: C.line });
      k.text(card, x + 138, y + 52, name, { size: 26, weight: 700, anchor: 'middle' });
      k.line(card, x + 40, y + 94, x + 236, y + 94, { stroke: C.line, sw: 1.5 });
      lines.forEach((s, j) => k.text(card, x + 138, y + 136 + j * 38, s, { size: 20, fill: C.sub, anchor: 'middle' }));
      return card;
    });
    k.hide(r.products, { dy: 24 });
    r.punch = k.text(L, 800, 620, '—— 你已经在使用 AI Agent 了。', { size: 34, weight: 700, anchor: 'middle' });
    k.hide(r.punch, { dy: 12 });

    // ── 第 2 步：被动对话 → 自主的智能系统 ──
    r.oldBox = k.g(L);
    k.rect(r.oldBox, 150, 290, 480, 370, { rx: 18, fill: C.panel, stroke: C.line });
    k.text(r.oldBox, 390, 338, '被动对话', { size: 28, weight: 700, fill: C.sub, anchor: 'middle' });
    r.bubbleQ = k.g(L);
    k.rect(r.bubbleQ, 400, 400, 190, 58, { rx: 29, fill: '#e4ecfb' });
    k.text(r.bubbleQ, 495, 429, '你问一句', { size: 22, anchor: 'middle' });
    r.bubbleA = k.g(L);
    k.rect(r.bubbleA, 190, 488, 190, 58, { rx: 29, stroke: C.line });
    k.text(r.bubbleA, 285, 517, '它答一句', { size: 22, anchor: 'middle' });
    r.oldNote = k.text(L, 390, 610, '一问一答，到此为止', { size: 20, fill: C.faint, anchor: 'middle' });
    r.oldParts = [r.oldBox, r.bubbleQ, r.bubbleA, r.oldNote];
    k.hide(r.oldParts, { dy: 10 });

    r.shift = k.arrow(L, 660, 475, 820, 475, { sw: 4, head: 18 });

    r.newBox = k.g(L);
    k.rect(r.newBox, 850, 290, 600, 370, { rx: 18, stroke: C.llm, sw: 2.5 });
    k.text(r.newBox, 1150, 338, '自主的智能系统', { size: 28, weight: 700, fill: C.llm, anchor: 'middle' });
    k.hide(r.newBox);
    r.nodes = [
      [1150, 410, '自主规划执行步骤', C.llm, C.llmBg],
      [1300, 590, '调用各种工具完成任务', C.tool, C.toolBg],
      [1000, 590, '根据结果不断调整策略', C.ctx, C.ctxBg],
    ].map(([x, y, label, color, bg]) => k.pill(L, x, y, label, { fill: bg, stroke: color }).g);
    k.hide(r.nodes, { dy: 8 });
    r.cycle = [
      k.arrow(L, 1215, 434, 1268, 566, { stroke: C.faint, sw: 2.5, head: 12 }),
      k.arrow(L, 1180, 590, 1120, 590, { stroke: C.faint, sw: 2.5, head: 12 }),
      k.arrow(L, 1032, 566, 1085, 434, { stroke: C.faint, sw: 2.5, head: 12 }),
    ];
    r.cycleLbl = k.text(L, 1150, 528, '循环', { size: 18, fill: C.faint, anchor: 'middle' });
    k.hide(r.cycleLbl);
    r.newWay = k.text(L, 800, 742, 'AI Agent 正在成为我们与计算机交互的一种全新方式', { size: 28, weight: 700, anchor: 'middle' });
    k.hide(r.newWay, { dy: 10 });

    // ── 第 3 步：本章是全书的概念地图 ──
    r.mapTitle = k.text(L, 800, 300, '本章是全书的概念地图', { size: 36, weight: 700, anchor: 'middle' });
    k.hide(r.mapTitle, { dy: 10 });
    // 零长度的圆头虚线会显示成一个点，所以先整体隐藏，画线时再显示
    r.route = k.line(L, 320, 470, 320, 470, { stroke: C.faint, sw: 5, dash: '1 14' });
    k.hide(r.route);
    r.stops = [
      [320, '核心公式', 'Agent = LLM + 上下文 + 工具', C.llm, C.llmBg],
      [640, '运行循环', 'ReAct：想 → 做 → 看', C.ctx, C.ctxBg],
      [960, '工程框架', 'Harness：约束 · 验证 · 纠正', C.tool, C.toolBg],
      [1280, '设计模式', '贯穿全书的五个模式', C.harness, C.harnessBg],
    ].map(([x, name, sub, color, bg], i) => {
      const stop = k.g(L);
      k.circle(stop, x, 470, 44, { fill: bg, stroke: color, sw: 3 });
      k.text(stop, x, 471, String(i + 1), { size: 30, weight: 700, fill: color, anchor: 'middle' });
      k.text(stop, x, 556, name, { size: 28, weight: 700, anchor: 'middle' });
      k.text(stop, x, 598, sub, { size: 19, fill: C.sub, anchor: 'middle' });
      return stop;
    });
    k.hide(r.stops, { dy: 12 });
    r.mapNote = k.text(L, 800, 720, '初次阅读不必逐一记住 —— 先建立整体印象，后续每一章展开其中一个方面', {
      size: 22, fill: C.sub, anchor: 'middle',
    });
    k.hide(r.mapNote);

    return r;
  },

  steps: [
    {
      narration: '如果你用 Cursor 写过代码，看它搜索代码库、编辑多个文件、运行测试直到通过；用 Deep Research 调研过一个课题；用 Manus 操控浏览器完成在线任务；让豆包手机助手帮你订票、发消息；或者让 Pine AI 替你打电话给运营商协商降低账单——你已经在使用 AI Agent 了。',
      build(tl, r, k, cue) {
        k.reveal(tl, [r.kicker, r.title], { duration: 0.7, stagger: 0.15 });
        ['Cursor', 'Deep Research', 'Manus', '豆包', 'Pine AI'].forEach((name, i) => {
          k.reveal(tl, r.products[i], { duration: 0.55 }, Math.max(cue(name), 1 + i * 0.3));
        });
        k.reveal(tl, r.punch, { duration: 0.6 }, cue('你已经在使用'));
      },
    },
    {
      narration: '这些产品形态各异，却有一个共同点：它们不再是“你问一句、它答一句”的被动对话，而是能够自主规划执行步骤、调用各种工具完成任务，并根据结果不断调整策略的智能系统。AI Agent 正在成为我们与计算机交互的一种全新方式。',
      build(tl, r, k, cue) {
        k.fade(tl, [...r.products, r.punch], 0, { duration: 0.45 });
        k.reveal(tl, r.oldBox, { duration: 0.5 }, 0.5);
        k.reveal(tl, r.bubbleQ, { duration: 0.4 }, cue('你问一句'));
        k.reveal(tl, r.bubbleA, { duration: 0.4 }, cue('它答一句'));
        k.reveal(tl, r.oldNote, { duration: 0.4 }, cue('被动对话'));
        const turn = cue('而是能够');
        k.fade(tl, r.oldParts, 0.4, { duration: 0.5 }, turn);
        k.grow(tl, r.shift, { duration: 0.5 }, turn);
        k.reveal(tl, r.newBox, { duration: 0.5 }, turn + 0.3);
        ['自主规划', '调用各种工具', '根据结果'].forEach((word, i) => {
          const t = Math.max(cue(word), turn + 0.8 + i * 0.8);
          k.reveal(tl, r.nodes[i], { duration: 0.4 }, t);
          k.grow(tl, r.cycle[i], { duration: 0.4 }, t + 0.4);
        });
        const sys = cue('智能系统');
        k.reveal(tl, r.cycleLbl, { duration: 0.3 }, sys);
        r.nodes.forEach((node, i) => k.pulse(tl, node, { scale: 1.1 }, sys + i * 0.3));
        k.reveal(tl, r.newWay, { duration: 0.6 }, cue('AI Agent 正在'));
      },
    },
    {
      narration: '本章是全书的概念地图：它会快速引入 Agent 的核心公式、运行循环、工程框架和设计模式，为后续章节提供统一的术语和参照坐标。初次阅读不必逐一记住所有概念，先建立整体印象；后续每一章都会展开其中的一个方面，届时可以随时回来对照。',
      build(tl, r, k, cue) {
        k.fade(tl, [...r.oldParts, r.shift.g, r.newBox, ...r.nodes, ...r.cycle.map((a) => a.g), r.cycleLbl, r.newWay], 0, {
          duration: 0.45,
        });
        k.reveal(tl, r.mapTitle, { duration: 0.5 }, 0.4);
        // 路线从第一站画到第四站，各站在路线经过时出现
        const t0 = Math.max(cue('核心公式'), 1);
        const t3 = Math.max(cue('设计模式'), t0 + 1.8);
        tl.set(r.route, { autoAlpha: 1 }, t0);
        tl.to(r.route, { attr: { x2: 1280 }, duration: t3 - t0, ease: 'none' }, t0);
        r.stops.forEach((stop, i) => k.reveal(tl, stop, { duration: 0.45 }, t0 + ((t3 - t0) * i) / 3));
        k.reveal(tl, r.mapNote, { duration: 0.6 }, cue('初次阅读'));
      },
    },
  ],
});
