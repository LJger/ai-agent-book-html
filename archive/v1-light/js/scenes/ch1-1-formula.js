/*
 * 场景 1-1：现代 Agent = LLM + 上下文 + 工具
 * 对应原书第一章首节：核心公式、大脑/眼睛/手脚、图1-1（Agent 与 Environment 的闭环、
 * Model–Harness 结构）、公式的重新展开，以及"直觉理解 / 实现组件 / 学术概念"对照表。
 */
(function () {
  'use strict';

  const SOURCE = '对应原书：第一章「现代 Agent = LLM + 上下文 + 工具」';

  // 三张组件卡片并排
  const CARD = { xs: [100, 580, 1060], y: 250, w: 440, h: 560 };

  // ── 卡片上的小图标：大脑（网络）、眼睛、锤子 ──

  function iconBrain(k, p, cx, cy, color) {
    const ic = k.g(p, { transform: `translate(${cx} ${cy})` });
    k.circle(ic, 0, 0, 22, { fill: k.C.white, stroke: color, sw: 3 });
    k.path(ic, 'M-9,-6 L9,-6 L0,9 Z', { stroke: color, sw: 2 });
    [[-9, -6], [9, -6], [0, 9]].forEach(([x, y]) => k.circle(ic, x, y, 4.5, { fill: color }));
  }

  function iconEye(k, p, cx, cy, color) {
    const ic = k.g(p, { transform: `translate(${cx} ${cy})` });
    k.path(ic, 'M-24,0 Q0,-20 24,0 Q0,20 -24,0 Z', { fill: k.C.white, stroke: color, sw: 3 });
    k.circle(ic, 0, 0, 7.5, { fill: color });
  }

  function iconTool(k, p, cx, cy, color) {
    const ic = k.g(p, { transform: `translate(${cx} ${cy}) rotate(-40)` });
    k.rect(ic, -4, -6, 8, 30, { rx: 3, fill: color });
    k.rect(ic, -15, -18, 30, 13, { rx: 3, fill: color });
  }

  // 一张组件卡片：顶部色带 + 标题、副标题、逐条出现的内容、底部职责条
  function card(L, k, i, spec) {
    const C = k.C;
    const x = CARD.xs[i];
    const { y, w, h } = CARD;
    const c = { g: k.g(L), cx: x + w / 2, cy: y + h / 2 };
    k.rect(c.g, x, y, w, h, { rx: 20 });
    k.path(c.g, `M${x},${y + 92} V${y + 20} Q${x},${y} ${x + 20},${y} H${x + w - 20} Q${x + w},${y} ${x + w},${y + 20} V${y + 92} Z`, { fill: spec.bg });
    k.rect(c.g, x, y, w, h, { rx: 20, fill: 'none', stroke: spec.color, sw: 2.5 });
    spec.icon(k, c.g, x + 54, y + 46, spec.color);
    k.text(c.g, x + 96, y + 47, [[spec.name, { fill: spec.color }], [` · ${spec.alias}`, {}]], { size: 32, weight: 700 });
    k.text(c.g, x + 32, y + 136, spec.subtitle, { size: 26, weight: 700 });
    c.items = spec.items(c.g, x, y);
    c.band = k.g(c.g);
    k.path(c.band, `M${x},${y + h - 80} H${x + w} V${y + h - 20} Q${x + w},${y + h} ${x + w - 20},${y + h} H${x + 20} Q${x},${y + h} ${x},${y + h - 20} Z`, { fill: spec.color });
    k.text(c.band, x + w / 2, y + h - 40, spec.duty, { size: 22, weight: 700, fill: C.white, anchor: 'middle' });
    k.hide(c.items, { dy: 10 });
    k.hide(c.band, { dy: 10 });
    k.hide(c.g, { dy: 24 });
    return c;
  }

  function buildCards(L, k) {
    const C = k.C;

    const llmSource = (g, x, top, head, body) => {
      const s = k.g(g);
      k.rect(s, x + 32, top, 376, 54, { rx: 12, fill: C.llmBg });
      k.text(s, x + 52, top + 27, head, { size: 20, weight: 700, fill: C.llm });
      k.text(s, x + 128, top + 27, body, { size: 20 });
      return s;
    };

    return [
      card(L, k, 0, {
        name: 'LLM', alias: '大脑', color: C.llm, bg: C.llmBg, icon: iconBrain,
        subtitle: 'Agent 的决策内核',
        duty: '大脑：负责思考和决策',
        items: (g, x, y) => [
          k.text(g, x + 32, y + 186, '不只是一组模型参数，而是：', { size: 20, fill: C.sub }),
          k.text(g, x + 32, y + 228, '理解意图 · 思考规划 · 做出判断', { size: 23, weight: 600 }),
          k.text(g, x + 32, y + 284, '能力来自两部分：', { size: 20, fill: C.sub }),
          llmSource(g, x, y + 308, '预训练', '积累的世界知识与语言能力'),
          llmSource(g, x, y + 374, '后训练', '固化的决策策略（第八章）'),
        ],
      }),
      card(L, k, 1, {
        name: '上下文', alias: '眼睛', color: C.ctx, bg: C.ctxBg, icon: iconEye,
        subtitle: '每个决策点的信息表示',
        duty: '眼睛：接收环境提供的观察',
        items: (g, x, y) => [
          k.text(g, x + 32, y + 186, '不只是输入给模型的那段文本，', { size: 20, fill: C.sub }),
          k.text(g, x + 32, y + 224, '而是收到并保留的这些信息：', { size: 20, fill: C.sub }),
          ...['环境观察', '用户记忆', '领域知识', '自身状态', '任务进展'].map((s, j) => k.pill(
            g, x + 87 + (j % 3) * 122, y + 282 + Math.floor(j / 3) * 58, s,
            { w: 110, h: 44, rx: 10, fill: C.ctxBg, stroke: C.ctx, sw: 1.5 },
          ).g),
        ],
      }),
      card(L, k, 2, {
        name: '工具', alias: '手脚', color: C.tool, bg: C.toolBg, icon: iconTool,
        subtitle: '感知或改变外部世界的接口',
        duty: '手脚：将决策转化为作用于环境的行动',
        items: (g, x, y) => [
          k.text(g, x + 32, y + 186, '包括工具定义、调用协议和适配器', { size: 20 }),
          k.text(g, x + 32, y + 232, '形态从简单到开放：', { size: 20, fill: C.sub }),
          ...['预定义的工具调用', '动态生成代码', '委托子 Agent 协作', '主动与用户沟通'].map((s, j) => {
            const b = k.g(g);
            k.circle(b, x + 42, y + 280 + j * 42, 5, { fill: C.tool });
            k.text(b, x + 60, y + 280 + j * 42, s, { size: 20 });
            return b;
          }),
        ],
      }),
    ];
  }

  // 图1-1：Agent（Model–Harness）与 Environment 的闭环交互
  function buildDiagram(r, k, D) {
    const C = k.C;

    r.agentBox = k.g(D);
    k.rect(r.agentBox, 90, 130, 640, 680, { rx: 22, stroke: C.ink, sw: 2.5 });
    k.text(r.agentBox, 122, 174, 'Agent（智能体）', { size: 30, weight: 700 });
    k.hide(r.agentBox);

    // Harness 层在第 8 步出现，画在组件之下
    r.harnessBox = k.g(D);
    r.harnessRect = k.rect(r.harnessBox, 125, 205, 570, 580, { rx: 16, fill: C.harnessBg, stroke: C.harness, sw: 2, dash: '9 6' });
    k.text(r.harnessBox, 410, 236, 'Harness（模型运行与交互层）', { size: 22, weight: 700, fill: C.harness, anchor: 'middle' });
    k.hide(r.harnessBox);
    r.harnessFoot = k.text(D, 410, 716, '循环 · 状态管理 · 权限 · 验证 · 纠正', { size: 20, fill: C.harness, anchor: 'middle' });
    k.hide(r.harnessFoot, { dy: 8 });

    const chip = (y, h, color, bg, title, sub, size) => {
      const c = { g: k.g(D), cy: y + h / 2 };
      c.rect = k.rect(c.g, 175, y, 470, h, { rx: 12, fill: bg, stroke: color, sw: 2.5 });
      c.title = k.text(c.g, 410, c.cy - 15, title, { size, weight: 700, fill: color, anchor: 'middle' });
      k.text(c.g, 410, c.cy + 19, sub, { size: 18, fill: C.sub, anchor: 'middle' });
      return c;
    };
    r.cCtx = chip(262, 88, C.ctx, C.ctxBg, '上下文（眼睛）', '观察 · 历史 · 记忆 · 任务状态', 24);
    r.cLlm = chip(400, 116, C.llm, C.llmBg, 'LLM（大脑）', '理解 · 推理 · 选择下一步行动', 28);
    r.cTool = chip(566, 88, C.tool, C.toolBg, '工具与动作接口（手脚）', '工具定义 · 调用协议 · 适配器', 24);
    r.modelTitle = k.text(r.cLlm.g, 410, r.cLlm.cy - 15, 'Model', { size: 30, weight: 700, fill: C.llm, anchor: 'middle' });
    k.hide(r.modelTitle);
    r.chips = [r.cCtx.g, r.cLlm.g, r.cTool.g];
    k.hide(r.chips, { dy: 10 });
    r.chipArrows = [
      k.arrow(D, 410, 352, 410, 398, { stroke: C.harness, sw: 2.5, head: 12 }),
      k.arrow(D, 410, 518, 410, 564, { stroke: C.harness, sw: 2.5, head: 12 }),
    ];

    r.envBox = k.g(D);
    k.rect(r.envBox, 1010, 130, 500, 680, { rx: 22, stroke: C.env, sw: 2.5 });
    k.text(r.envBox, 1042, 174, 'Environment（环境）', { size: 30, weight: 700, fill: C.env });
    k.hide(r.envBox, { dx: 40 });

    r.ruleHi = k.rect(D, 1172, 206, 176, 32, { rx: 16, fill: C.envBg, stroke: C.env, sw: 1.5 });
    k.hide(r.ruleHi);
    r.envRule = k.text(D, 1260, 222, '状态与转移规律', { size: 20, fill: C.sub, anchor: 'middle' });

    r.stateBox = k.g(D);
    k.rect(r.stateBox, 1050, 250, 420, 112, { rx: 12, fill: C.envBg, stroke: C.env, sw: 2 });
    k.text(r.stateBox, 1080, 290, '当前状态', { size: 24, weight: 700 });
    k.text(r.stateBox, 1080, 328, '执行行动后产生新状态', { size: 18, fill: C.sub });
    k.rect(r.stateBox, 1372, 280, 76, 52, { rx: 10, stroke: C.env, sw: 2 });
    r.states = ['s₀', 's₁', 's₂'].map((s) => k.text(r.stateBox, 1410, 306, s, { size: 26, weight: 700, fill: C.env, anchor: 'middle' }));
    k.hide(r.states.slice(1));

    r.envDivider = k.line(D, 1050, 398, 1470, 398, { stroke: C.line, sw: 1.5 });
    r.envHead = [r.envRule, r.stateBox, r.envDivider];
    r.envItems = ['文件系统 · 数据库', '网页 · API · 应用程序', '用户 · 其他 Agent', '仿真或物理世界']
      .map((s, i) => k.text(D, 1050, 446 + i * 50, s, { size: 22 }));
    k.hide([...r.envHead, ...r.envItems], { dy: 8 });

    // 闭环：观察从环境进入上下文，行动从工具接口作用于环境
    r.obs = k.arrow(D, 1008, 306, 648, 306, { stroke: C.ctx, sw: 3.5, head: 16 });
    r.act = k.arrow(D, 648, 610, 1008, 610, { stroke: C.tool, sw: 3.5, head: 16 });
    r.obsLbl = [
      k.text(D, 870, 282, '观察', { size: 24, weight: 700, fill: C.ctx, anchor: 'middle' }),
      k.text(D, 870, 332, 'observation', { size: 17, fill: C.sub, anchor: 'middle' }),
    ];
    r.actLbl = [
      k.text(D, 870, 586, '行动', { size: 24, weight: 700, fill: C.tool, anchor: 'middle' }),
      k.text(D, 870, 636, 'action', { size: 17, fill: C.sub, anchor: 'middle' }),
    ];
    k.hide([...r.obsLbl, ...r.actLbl]);
    r.pObs = [0, 1].map(() => k.circle(D, 1008, 306, 10, { fill: C.ctx }));
    r.pAct = [0, 1].map(() => k.circle(D, 648, 610, 10, { fill: C.tool }));
    k.hide([...r.pObs, ...r.pAct]);

    // Harness 可以创建、隔离或代理环境，但不包含环境自身的状态与转移规律
    r.proxy = k.arrow(D, 697, 752, 1008, 752, { stroke: C.harness, sw: 2.5, dash: '8 6', head: 14 });
    r.proxyLbl = k.text(D, 852, 730, '可创建 · 隔离 · 代理', { size: 18, weight: 600, fill: C.harness, anchor: 'middle' });
    r.envNote = k.text(D, 1260, 752, '但不包含环境自身的状态与转移规律', { size: 18, fill: C.sub, anchor: 'middle' });
    k.hide([r.proxyLbl, r.envNote]);
  }

  // 第 9 步：公式重新展开（LLM → Model，上下文 + 工具 → 最小 Harness）
  function buildMapping(r, k, M) {
    const C = k.C;
    r.mapTokens = [
      ['Agent', C.ink], ['=', C.faint], ['LLM', C.llm], ['+', C.faint], ['上下文', C.ctx], ['+', C.faint], ['工具', C.tool],
    ].map(([s, fill]) => k.text(M, 0, 592, s, { size: 54, weight: 700, fill }));
    const spans = k.layoutRow(r.mapTokens, 800, 22);

    const bracket = (x1, x2, color, label) => {
      const b = k.g(M);
      const mid = (x1 + x2) / 2;
      k.path(b, `M${x1},630 v12 H${x2} v-12 M${mid},642 v14`, { stroke: color, sw: 2.5 });
      k.text(b, mid, 678, label, { size: 26, weight: 700, fill: color, anchor: 'middle' });
      return b;
    };
    r.brLlm = bracket(spans[2][0], spans[2][1], C.llm, 'Model');
    r.brHar = bracket(spans[4][0], spans[6][1], C.harness, '最小 Harness');

    // 一行居中：说明文字 + 三个虚线胶囊
    r.prodLead = k.text(M, 0, 764, [['生产系统还会在 ', {}], ['Harness', { fill: C.harness, weight: 700 }], [' 中加入', {}]], { size: 24 });
    const pills = ['约束', '验证', '纠正'].map((s) => k.pill(M, 0, 764, s, {
      size: 22, fill: C.white, stroke: C.harness, dash: '6 4', color: C.harness, weight: 700,
    }));
    const leadW = k.measure(r.prodLead);
    const total = leadW + 20 + pills.reduce((sum, p) => sum + p.w, 0) + 14 * (pills.length - 1);
    let x = 800 - total / 2;
    r.prodLead.setAttribute('x', x);
    x += leadW + 20;
    pills.forEach((p) => {
      k.placePill(p, x + p.w / 2, 764);
      x += p.w + 14;
    });
    r.prodPills = pills.map((p) => p.g);
    r.mapNote = k.text(M, 800, 836, '后文所有架构都遵循这条边界', { size: 20, fill: C.sub, anchor: 'middle' });
    k.hide([...r.mapTokens, r.brLlm, r.brHar, r.prodLead, ...r.prodPills, r.mapNote], { dy: 8 });
  }

  // 第 10 步：直觉理解 / 实现组件 / 学术概念 / 含义 对照表
  function buildTable(r, k, L) {
    const C = k.C;
    const X = [150, 320, 560, 820];
    r.tableTitle = k.text(L, 800, 112, '三个组件与强化学习概念的映射', { size: 30, weight: 700, anchor: 'middle' });

    r.tableFrame = k.g(L);
    k.rect(r.tableFrame, 150, 160, 1300, 418, { rx: 14 });
    k.path(r.tableFrame, 'M150,224 V174 Q150,160 164,160 H1436 Q1450,160 1450,174 V224 Z', { fill: C.panel });
    [224, 342, 460].forEach((y) => k.line(r.tableFrame, 150, y, 1450, y, { stroke: C.line, sw: 1.5 }));
    X.slice(1).forEach((x) => k.line(r.tableFrame, x, 160, x, 578, { stroke: C.line, sw: 1.5 }));
    k.rect(r.tableFrame, 150, 160, 1300, 418, { rx: 14, fill: 'none', stroke: C.line, sw: 2 });
    ['直觉理解', '实现组件', '学术概念', '含义'].forEach((s, i) => k.text(r.tableFrame, X[i] + 24, 192, s, { size: 20, weight: 700, fill: C.sub }));

    r.rows = [
      ['大脑', C.llm, 'LLM', '策略（Policy）', ['Agent 决定“下一步做什么”的决策逻辑——', '面对当前看到的信息，从所有可选行动中挑出最合适的一个']],
      ['眼睛', C.ctx, '上下文构造', '观察与历史', ['将环境返回的观察与已有历史，', '组织成当前决策所需的信息']],
      ['手脚', C.tool, '工具与适配器', '观察 / 行动接口', ['规定 Agent 可以读取哪些观察、发出哪些行动，', '以及接口采用什么格式']],
    ].map(([intuition, color, impl, concept, meaning], j) => {
      const cy = 283 + j * 118;
      const row = k.g(L);
      k.text(row, X[0] + 24, cy, intuition, { size: 30, weight: 700, fill: color });
      k.text(row, X[1] + 24, cy, impl, { size: 24, weight: 700 });
      k.text(row, X[2] + 24, cy, concept, { size: 24, weight: 700 });
      k.text(row, X[3] + 24, cy - 17, meaning[0], { size: 20 });
      k.text(row, X[3] + 24, cy + 17, meaning[1], { size: 20 });
      return row;
    });

    r.caveat = k.g(L);
    k.rect(r.caveat, 150, 622, 1300, 190, { rx: 14, fill: '#fbf7ef', stroke: '#e8d9bd', sw: 1.5 });
    k.text(r.caveat, 182, 664, '可以映射，但不是严格的一一等同', { size: 24, weight: 700 });
    k.text(r.caveat, 182, 716, '•  上下文是具体观察和历史在 Agent 内部的表示，并不等于整个观察空间', { size: 20 });
    k.text(r.caveat, 182, 762, '•  工具定义 Agent 可使用的观察与行动接口，工具背后的对象仍属于环境', { size: 20 });

    k.hide([r.tableTitle, ...r.rows, r.caveat], { dy: 10 });
    k.hide(r.tableFrame);
  }

  // 卡片内容按旁白逐条出现；words[i] 是第 i 条内容在旁白里对应的词
  function revealByCue(tl, k, cue, items, words, from) {
    words.forEach((w, i) => k.reveal(tl, items[i], { duration: 0.4 }, Math.max(cue(w), from + i * 0.35)));
  }

  AB.registerScene({
    id: 'ch1-1',
    chapter: '第一章 AI Agent 入门',
    title: '核心公式：Agent = LLM + 上下文 + 工具',
    source: SOURCE,

    setup(L, k) {
      const C = k.C;
      const r = {};

      // 公式：第 1 步居中登场，第 2 步缩到顶部
      r.formula = k.g(L);
      r.tokens = [
        ['Agent', C.ink], ['=', C.faint], ['LLM', C.llm], ['+', C.faint], ['上下文', C.ctx], ['+', C.faint], ['工具', C.tool],
      ].map(([s, fill]) => k.text(r.formula, 0, 410, s, { size: 84, weight: 700, fill }));
      k.layoutRow(r.tokens, 800, 30);
      k.hide(r.tokens, { dy: 26 });
      r.formulaNote = k.text(L, 800, 520, '“+” 表示工程组件的组合，而不是强化学习中的形式化定义', { size: 26, fill: C.sub, anchor: 'middle' });
      k.hide(r.formulaNote, { dy: 10 });

      // 图1-1 放在卡片之前，第 6 步卡片收拢时从图的上方飞入
      r.diagram = k.g(L);
      buildDiagram(r, k, r.diagram);

      r.cards = buildCards(L, k);
      r.formula2 = k.text(L, 800, 196, [
        ['Agent = ', {}], ['大脑', { fill: C.llm }], [' + ', { fill: C.faint }],
        ['眼睛', { fill: C.ctx }], [' + ', { fill: C.faint }], ['手脚', { fill: C.tool }],
      ], { size: 34, weight: 700, anchor: 'middle' });
      k.hide(r.formula2, { dy: 8 });

      r.cap6 = k.text(L, 800, 852, '公式只描述 Agent 边界之内的实现 —— 不包含 Environment', { size: 24, weight: 600, anchor: 'middle' });
      r.cap7 = k.text(L, 800, 852, '环境返回观察 → Agent 依据上下文选择行动 → 行动改变环境状态 → 新状态产生下一次观察', { size: 22, weight: 600, anchor: 'middle' });
      r.cap8 = k.text(L, 800, 852, 'Model 负责策略决策；Harness 是环绕模型的运行与治理层', { size: 24, weight: 600, anchor: 'middle' });
      k.hide([r.cap6, r.cap7, r.cap8], { dy: 8 });

      r.map = k.g(L);
      buildMapping(r, k, r.map);
      buildTable(r, k, L);
      return r;
    },

    steps: [
      {
        narration: '现代 Agent 的最小工程实现，可以用一个简洁的公式来表达：Agent = LLM（大语言模型）+ 上下文 + 工具。这里的加号表示工程组件的组合，而不是强化学习中的形式化定义。公式里的每个词，都需要做广义但边界清楚的理解。',
        build(tl, r, k, cue) {
          k.reveal(tl, r.tokens, { duration: 0.55, stagger: 0.22, ease: 'back.out(1.7)' });
          k.reveal(tl, r.formulaNote, { duration: 0.6 }, Math.max(cue('这里的加号'), 2.2));
        },
      },
      {
        narration: 'LLM 是 Agent 的大脑。它不只是一组模型参数，而是 Agent 的整个决策内核——理解意图、思考规划、做出判断。就像人类大脑不只是神经元的集合，LLM 的能力也来自两部分：预训练所积累的世界知识与语言能力，以及后训练所固化的决策策略（监督微调、强化学习等技术在第八章展开）。',
        build(tl, r, k, cue) {
          k.fade(tl, r.formulaNote, 0, { duration: 0.3 });
          tl.to(r.formula, { y: -280, scale: 0.5, svgOrigin: '800 410', duration: 0.9, ease: 'power2.inOut' });
          k.reveal(tl, r.cards[0].g, { duration: 0.6 }, '-=0.15');
          k.pulse(tl, r.tokens[2], { scale: 1.2 }, '<');
          revealByCue(tl, k, cue, r.cards[0].items, ['不只是一组模型参数', '理解意图', '两部分', '预训练', '后训练'], 1.6);
        },
      },
      {
        narration: '上下文是 Agent 的眼睛。它不只是输入给模型的那段文本，而是 Agent 在每个决策点收到并保留的信息表示——来自环境的观察、用户记忆、领域知识、自身状态和任务进展。',
        build(tl, r, k, cue) {
          k.reveal(tl, r.cards[1].g, { duration: 0.6 });
          k.pulse(tl, r.tokens[4], { scale: 1.2 }, '<');
          revealByCue(tl, k, cue, r.cards[1].items, ['不只是输入', '而是 Agent', '环境的观察', '用户记忆', '领域知识', '自身状态', '任务进展'], 0.8);
        },
      },
      {
        narration: '工具是 Agent 的手脚。这里的“工具”指 Agent 用来感知或改变外部世界的接口，包括工具定义、调用协议和适配器——从预定义的工具调用到动态生成代码，从委托子 Agent 协作到主动与用户沟通。',
        build(tl, r, k, cue) {
          k.reveal(tl, r.cards[2].g, { duration: 0.6 });
          k.pulse(tl, r.tokens[6], { scale: 1.2 }, '<');
          revealByCue(tl, k, cue, r.cards[2].items, ['包括工具定义', '从预定义', '预定义的工具调用', '动态生成代码', '委托子 Agent', '主动与用户沟通'], 0.8);
        },
      },
      {
        narration: '换一种更直观的说法：Agent = 大脑 + 眼睛 + 手脚。大脑负责思考和决策，眼睛接收环境提供的观察，手脚将决策转化为作用于环境的行动。',
        build(tl, r, k, cue) {
          k.reveal(tl, r.formula2, { duration: 0.6 }, cue('Agent = 大脑'));
          revealByCue(tl, k, cue, r.cards.map((c) => c.band), ['大脑负责', '眼睛接收', '手脚将决策'], 1);
        },
      },
      {
        narration: '更重要的是，这个公式只描述 Agent 边界之内的实现，不包含 Agent 与之交互的 Environment（环境）。环境包含文件、数据库、网页、用户、其他 Agent 以及物理或仿真世界，Agent 只能通过观察和行动接口与它交互。',
        source: `${SOURCE} · 图1-1`,
        build(tl, r, k, cue) {
          k.fade(tl, [r.formula, r.formula2], 0, { duration: 0.4 });
          // 三张卡片收拢成 Agent 内部的三个组件
          tl.addLabel('fly');
          [r.cLlm, r.cCtx, r.cTool].forEach((chip, i) => {
            const c = r.cards[i];
            tl.to(c.g, {
              x: 410 - c.cx, y: chip.cy - c.cy, scale: 0.26, svgOrigin: `${c.cx} ${c.cy}`,
              autoAlpha: 0, duration: 0.85, ease: 'power2.in',
            }, `fly+=${i * 0.1}`);
          });
          k.reveal(tl, r.agentBox, { duration: 0.5 }, 'fly+=0.35');
          k.reveal(tl, r.chips, { duration: 0.45, stagger: 0.12 }, 'fly+=0.7');
          r.chipArrows.forEach((a, i) => k.grow(tl, a, { duration: 0.35 }, `fly+=${1.3 + i * 0.4}`));
          const env = Math.max(cue('Environment'), 2.6);
          k.reveal(tl, r.envBox, { duration: 0.6 }, env);
          k.reveal(tl, r.envHead, { duration: 0.4, stagger: 0.12 }, env + 0.5);
          revealByCue(tl, k, cue, r.envItems, ['文件', '网页', '用户', '物理或仿真'], env + 1);
          k.reveal(tl, r.cap6, { duration: 0.5 }, cue('Agent 只能通过'));
        },
      },
      {
        narration: '在经典的强化学习和控制论视角下，Agent 与 Environment 是闭环交互的两方，而不是彼此的组成部分：环境不断向 Agent 返回当前观察，Agent 根据已有上下文选择下一步行动；行动改变环境状态，新的状态再产生下一次观察，循环由此继续。这是理解所有 Agent 交互的最小结构。',
        source: `${SOURCE} · 图1-1`,
        build(tl, r, k, cue) {
          k.fade(tl, r.cap6, 0, { duration: 0.3 });
          k.grow(tl, r.obs, { duration: 0.7 });
          k.fade(tl, r.obsLbl, 1, { duration: 0.4 }, '<');
          k.grow(tl, r.act, { duration: 0.7 }, '+=0.1');
          k.fade(tl, r.actLbl, 1, { duration: 0.4 }, '<');
          k.reveal(tl, r.cap7, { duration: 0.5 }, '+=0.2');

          // 一圈：观察进入上下文 → 组件依次处理 → 行动作用于环境 → 环境状态更新
          const loop = (n, t) => {
            tl.set(r.pObs[n], { autoAlpha: 1 }, t.obs);
            tl.to(r.pObs[n], { attr: { cx: 656 }, duration: 1, ease: 'power1.inOut' }, t.obs);
            tl.set(r.pObs[n], { autoAlpha: 0 }, t.obs + 1);
            k.glow(tl, r.cCtx.rect, {}, t.think);
            k.glow(tl, r.cLlm.rect, {}, t.think + 0.5);
            k.glow(tl, r.cTool.rect, {}, t.think + 1);
            tl.set(r.pAct[n], { autoAlpha: 1 }, t.act);
            tl.to(r.pAct[n], { attr: { cx: 1000 }, duration: 1, ease: 'power1.inOut' }, t.act);
            tl.set(r.pAct[n], { autoAlpha: 0 }, t.act + 1);
            k.pulse(tl, r.stateBox, { scale: 1.04 }, t.state);
            k.swap(tl, r.states[n], r.states[n + 1], {}, t.state);
          };
          // 第一圈跟着旁白逐句走，第二圈在"循环由此继续"时紧接着转
          const obs = Math.max(cue('环境不断'), 3);
          const think = Math.max(cue('Agent 根据已有上下文'), obs + 1);
          const act = Math.max(cue('行动改变'), think + 1.5);
          const state = Math.max(cue('新的状态'), act + 1);
          loop(0, { obs, think, act, state });
          const again = Math.max(cue('循环由此继续'), state + 0.8);
          loop(1, { obs: again, think: again + 1, act: again + 2.6, state: again + 3.6 });
        },
      },
      {
        narration: 'Agent 内部是 Model–Harness 结构：Model 负责策略决策；Harness 是 Agent 边界内环绕模型的运行与治理层，负责构造上下文、暴露工具接口、维护循环和状态，并实施权限、验证与纠正。Harness 可以创建、隔离或代理一个环境，却不因此包含环境自身的状态与转移规律。',
        source: `${SOURCE} · 图1-1`,
        build(tl, r, k, cue) {
          k.fade(tl, r.cap7, 0, { duration: 0.3 });
          k.fade(tl, r.harnessBox, 1, { duration: 0.7 }, 0.3);
          k.swap(tl, r.cLlm.title, r.modelTitle, { duration: 0.35 }, Math.max(cue('Model 负责'), 1.2));
          k.glow(tl, r.harnessRect, {}, cue('Harness 是'));
          k.glow(tl, r.cCtx.rect, {}, cue('构造上下文'));
          k.glow(tl, r.cTool.rect, {}, cue('暴露工具接口'));
          k.reveal(tl, r.harnessFoot, { duration: 0.5 }, cue('维护循环'));
          const proxy = cue('Harness 可以创建');
          k.grow(tl, r.proxy, { duration: 0.7 }, proxy);
          k.fade(tl, r.proxyLbl, 1, { duration: 0.4 }, proxy + 0.3);
          const own = cue('环境自身的状态');
          k.fade(tl, r.ruleHi, 1, { duration: 0.4 }, own);
          k.pulse(tl, r.ruleHi, { scale: 1.08 }, own + 0.4);
          k.fade(tl, r.envNote, 1, { duration: 0.5 }, own + 0.4);
          k.reveal(tl, r.cap8, { duration: 0.5 }, own + 1.2);
        },
      },
      {
        narration: '据此可以把开头的工程公式重新展开：LLM 对应 Model，“上下文 + 工具”构成最小 Harness；生产系统还会在 Harness 中加入约束、验证和纠正。后文所有架构都遵循这条边界。',
        build(tl, r, k, cue) {
          k.fade(tl, r.cap8, 0, { duration: 0.3 });
          tl.to(r.diagram, { scale: 0.58, y: -70, svgOrigin: '800 130', duration: 1, ease: 'power2.inOut' }, 0.2);
          k.reveal(tl, r.mapTokens, { duration: 0.4, stagger: 0.08 }, 1);
          const llm = Math.max(cue('LLM 对应'), 2);
          k.reveal(tl, r.brLlm, { duration: 0.45 }, llm);
          k.glow(tl, r.cLlm.rect, { width: 7 }, llm);
          const harness = Math.max(cue('上下文 + 工具'), llm + 1);
          k.reveal(tl, r.brHar, { duration: 0.45 }, harness);
          k.glow(tl, r.harnessRect, { width: 5 }, harness);
          k.reveal(tl, r.prodLead, { duration: 0.45 }, Math.max(cue('生产系统'), harness + 1));
          k.reveal(tl, r.prodPills, { duration: 0.4, stagger: 0.35 }, Math.max(cue('约束'), harness + 1.5));
          k.reveal(tl, r.mapNote, { duration: 0.5 }, cue('后文所有架构'));
        },
      },
      {
        narration: '这三个工程组件可以映射到强化学习的策略与交互接口，但不是严格的一一等同：上下文是具体观察和历史在 Agent 内部的表示，并不等于整个观察空间；工具则定义 Agent 可使用的观察与行动接口，工具背后的对象仍属于环境。',
        source: `${SOURCE} · 直觉理解 / 实现组件 / 学术概念对照表`,
        build(tl, r, k, cue) {
          k.fade(tl, [r.diagram, r.map], 0, { duration: 0.5 });
          k.reveal(tl, r.tableTitle, { duration: 0.5 });
          k.fade(tl, r.tableFrame, 1, { duration: 0.5 }, '-=0.1');
          k.reveal(tl, r.rows, { duration: 0.5, stagger: 0.6 });
          k.reveal(tl, r.caveat, { duration: 0.6 }, Math.max(cue('但不是严格'), tl.duration() + 0.3));
        },
      },
    ],
  });
})();
