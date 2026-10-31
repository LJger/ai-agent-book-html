# 制作规范：深入理解 AI Agent · 动画版

> 给参与制作的每个人（包括子代理）。动手前通读一遍；写页面时随时回来查。
> 风格已经定稿：以 `src/ch01/` 为样板，深色玻璃质感 + 粒子背景 + 分步动画（视觉参照用户的分享会 HTML，见文末“参考资料”）。

## 1. 目标与底线

- **一章一个 HTML**，双击就能打开，不需要联网；总目录 `web/index.html` 把各章串起来。
- **内容深度与原书一致，要点不缺失**：原书的每一节、每个实验、每张图、每张表、每道思考题都要有对应页面；加粗要点尽量全部出现。
- **概念要有动画演示**：机制类内容（循环、数据流、缓存、检索、训练……）做成可播放、可交互的演示，不能只放文字。
- **不编造事实**：数字只能来自原书或配套仓库（`upstream/chapterN/`）的实验记录。为了演示而虚构的数值、对话、界面，必须在页面上标注“示意”。
- **检查不截图**：只用本文第 9 节的工具做非视觉检查；视觉效果由用户亲自看。

## 2. 目录与构建

```
src/engine/        共用引擎（只读）：shell.html deck.css core.js runtime.js icons.svg
src/hub/           总目录（只读）
src/chapters.json  全书章节清单（只读）
src/chNN/          一章一个目录 ← 你只改这里
  chapter.json     分部配置 + ready 标记
  00-opening.html  封面、本章导览
  01-xxx.html …    各部分：分隔页 + 内容页（文件名排序 = 播放顺序）
  NN-closing.html  本章小结、思考题、章末导航
storyboard/chNN-plan.md  本章计划与覆盖清单 ← 你也写这个
tools/             构建与检查脚本（只读）
web/               构建产物（不要手改）
upstream/          原书仓库的只读副本
```

章节编号与原书文件：`ch00` = `upstream/book/introduction.md`，`ch01`–`ch10` = `chapter1.md`–`chapter10.md`，`ch11` = `afterword.md`。思考题参考答案在 `upstream/book/reference-answers.md`。

`chapter.json`：

```json
{
  "ready": false,
  "autoMs": 10000,
  "parts": [
    { "n": "开篇", "k": "OPENING", "short": "开篇", "acc": "#38bdf8", "acc2": "#a78bfa" },
    { "n": "API 的上下文结构", "k": "PART 01", "short": "API", "acc": "#22d3ee", "acc2": "#60a5fa" },
    { "n": "收束", "k": "CLOSING", "short": "收束", "acc": "#38bdf8", "acc2": "#a78bfa" }
  ]
}
```

- `parts[i]` 是第 i 部分：`n` 名称，`k` 编号标签，`short` 是分隔页环形图上的短标签（≤ 6 个字），`acc/acc2` 是该部分的强调色（背景粒子、标题渐变、进度条都会随之变色）。
- 第 0 部分固定为“开篇”，最后一部分固定为“收束”。总数建议 ≤ 11（数字键 0–9 可直接跳转）。
- 全部完成、检查通过后，把 `ready` 改成 `true`，总目录才会显示为可播放。

## 3. 页面结构

### 3.1 页面属性

```html
<section class="slide" id="c03-rag-flow" data-part="2" data-steps="3" data-trans="zoom"
  data-title="RAG 的检索管道" data-notes="……讲解全文……">
```

| 属性 | 说明 |
|---|---|
| `id` | 全章唯一，统一前缀 `cNN-`（第一章用的是 `c1-`）。钩子写 `HOOKS['同一个id']` |
| `data-part` | 所属部分的序号（对应 chapter.json 的 parts） |
| `data-steps` | 页内步数。按 → 先走完本页的步骤，再翻下一页。0 或省略表示没有分步 |
| `data-trans` | 入场过渡：`slide`（默认）、`zoom`、`flip`、`rise`、`iris`；分隔页自动用 `warp`。同一部分内要交替使用，别全是默认 |
| `data-title` | 页面标题（目录、讲解面板、继续观看都用它） |
| `data-notes` | **讲解全文**，按 N 键显示。见第 4 节 |
| `data-dur` | 自动播放时本页每一步停留的毫秒数（默认取 chapter.json 的 autoMs）。内容多的页可以设长一些 |

属性值里**不能出现英文双引号 `"`**（会截断属性）。引号用中文“”或「」，必须用英文引号时写 `&quot;`。`<` `>` 用于 `<b>` 等标签可以，作为字符时写 `&lt;` `&gt;`。

### 3.2 标准页型

**普通内容页**（标题 + 主体 + 出处）：

```html
<section class="slide" id="c03-xxx" data-part="1" data-title="…" data-notes="…">
  <header class="sh"><div class="kicker"></div><h2 class="title fx fx-up" style="--d:1">标题里<em>强调部分</em>用 em</h2>
  <p class="lead fx fx-up" style="--d:2">一句话副标题（可选）</p></header>
  ……主体……
  <div class="src">第三章 ·「原书小节标题原文」· 图3-2</div>
</section>
```

- `.kicker` 留空，运行时会自动填“PART 02 · 部分名”。
- 标题栏右侧要放控件时，左边两项必须包一层：`<header class="sh"><div><div class="kicker"></div><h2 …></h2></div><div class="控件">…</div></header>`，并给 `.sh` 设 `display:flex;justify-content:space-between;align-items:flex-end`。
- **`.src` 出处必须写原书小节标题原文**（放在「」里），覆盖率工具靠它和讲解文字核对。一页覆盖多个小节就都写上；涉及的图号、实验号也写上。

**分隔页**（每个部分的第一页）：

```html
<section class="slide chapter" id="c03-d2" data-part="2" data-title="PART 02 · RAG" data-notes="…">
  <div class="ch-k fx fx-up">PART 02</div>
  <h1 class="ch-t fx fx-up" style="--d:2">知识库与 RAG</h1>
  <div class="ch-s fx fx-up" style="--d:3">一句话说明这一部分讲什么</div>
  <blockquote class="quote fx fx-blur" style="--d:6">原书中最能概括这一部分的一句话</blockquote>
  <div class="ch-loop" data-node="1" data-num="02"></div>
</section>
```

`data-node` = 部分序号 − 1（环形图上高亮第几个节点），`data-num` 是大号描边数字。标题太长时用 `style="font-size:88px"` 之类压一压，右侧 660px 是环形图的位置。

**封面**：参照 `src/ch01/00-opening.html` 的 `c1-cover`（逐字入场的标题 + `U.orbit` 轨道图）。每章换成自己的主题图形与配色。

**章末导航页**（最后一页）：

```html
<div class="end-nav">
  <a class="btn pri" data-nav="next"><span data-nav-label></span><svg class="ic"><use href="#i-arrow"/></svg></a>
  <a class="btn" data-nav="prev"><svg class="ic"><use href="#i-left"/></svg><span data-nav-label></span></a>
  <a class="btn" data-nav="hub"><svg class="ic"><use href="#i-home"/></svg>返回总目录</a>
</div>
```

`data-nav` 的链接和文字由运行时自动填写；目标章节未完成时自动显示为“制作中”。

### 3.3 每章必备

1. 封面；本章导览（本章讲什么、各部分之间的关系，可点击跳转到各部分，参照 `c1-map`）。
2. 每个部分：分隔页 + 若干内容页。
3. 原书每个**实验**单独成页（或一组相关实验一页），标题写“实验 N-M ★★：标题”，用模拟演示讲清实验设计与结论；配套仓库里有真实运行记录的，用真实数据并注明来源（如“数据：配套仓库 chapter1/context 验收记录，2026-09-01，DeepSeek V4 Flash”）。
4. 原书每张**图**：用动画重画，`.src` 里写图号。截图类的图（png 界面截图）可以用示意界面代替并注明。
5. 原书每张**表**：做成可交互的表（高亮、筛选、点选展开）或卡片。
6. **本章小结**页。
7. **思考题**页：列出全部题目（保留难度星级）；点击题目展开 `reference-answers.md` 中对应的参考答案要点（标注“参考答案提纲，原书附录”）。引言、后记没有思考题则省略。
8. 章末导航页。

## 4. 内容规则

- **先读完整章原文再动手**。每一节逐段过：论点、例子、数字、表格、加粗句、实验、脚注里的关键信息。
- **讲解（data-notes）承载原书深度**：用接近原文的表述把这一页对应的内容讲完整——原书的推理链条、限定条件、例外都要保留，可以精简措辞，不能删论点。加粗关键句尽量原样保留（用 `<b>`）。长度通常 150–500 字。
- **页面文字给出要点**：标题点明结论，主体用图示 + 关键词 + 短句；不要把整段原文贴到页面上，但也不能只剩关键词——观众不开讲解也要能看懂主线。
- 术语与原书一致（中文术语 + 原书给出的英文）。产品名、模型名、数字、日期照原书写。
- 原书标注为“选读 / 深水区”的内容也要做，可以在页面上标注“选读”。
- 拿不准原书意思时，宁可少说，不要演绎。
- 覆盖率工具会报出未出现的加粗要点：逐条处理——补到页面或讲解里，或者确认它只是修辞强调（在计划文件里记一笔）。

## 5. 动画与交互

每页至少一个动态元素；概念页必须有演示。常用手法：

| 手法 | 适用 | 样板 |
|---|---|---|
| 分步展开（`data-steps` + `data-step`） | 逐层讲解、对比前后 | `c1-formula`、`c1-expand` |
| 自动轮播 + 点击选择（`ctx.every`） | 并列的几类、几个案例 | `c1-products`、`c1-rlmap` |
| 开关 / 分段按钮（`U.seg`、`.tgl`） | “如果……会怎样”的对照 | `c1-shift` |
| 数据包沿路径流动（`U.fly` + `await`） | 消息流、调用链、循环 | `c1-loop` |
| 计数 / 打字 / 乱码揭示（`data-count`、`data-type`、`data-scramble`） | 数字结论、代码、输出 | 引擎内置 |
| 画布模拟（`ctx.raf` + canvas） | 粒子、随机过程、训练曲线 | 参考分享会 HTML 的漏斗页 |
| 翻牌（`.flip`）、勾选（`.chk`）、滑块（`.rng`） | 概念对照、清单、参数影响 | 引擎内置 |

要求：
- 交互必须有默认的自动演示（不点也会动），点了以后进入手动模式。
- 循环动画用“令牌”防止重入：`const tk = (this.tk = (this.tk || 0) + 1)`，每个 `await` 之后检查 `if (tk !== this.tk || !ctx.alive) return;`。
- 计时一律用 `ctx.later / ctx.every / ctx.raf / U.wait(ctx, ms)`，离开页面时会自动清理。不要直接用 `setInterval`。
- `reset(s)` 里把页面恢复到初始状态（清掉 `.on`、清空动态插入的内容、`this.tk++`）。
- 每帧动画的 DOM 元素控制在百个以内；粒子多用 canvas。

## 6. 引擎速查

### 6.1 页面钩子

```js
HOOKS['c03-xxx'] = {
  init(s) {},              // 页面加载时调用一次：生成 DOM、绑定事件
  enter(s, ctx, k, dir) {}, // 进入本页；k 当前步，dir 1 前进 / -1 后退
  step(s, ctx, k, dir) {},  // 页内切换步骤
  leave(s) {},             // 离开时
  reset(s) {},             // 离场动画结束后，恢复初始状态
};
```

`data-step="n"` 的元素在第 n 步时被运行时加上 `.on`（配合 `.fx` 就是“第 n 步出现”）。**不要在带 `data-step` 的元素上自己控制 `.on`**，会被运行时覆盖。

### 6.2 `U` 工具

| 函数 | 作用 |
|---|---|
| `U.fly(dot, path, ms, {ctx, alive, reverse, keep, linear, delay})` | SVG 圆点沿同一个 `<svg>` 里的 path 走一遍，返回 Promise；`alive` 是可选的中止条件函数（传入检查令牌的 `ok`，切换状态时旧动画立刻停下） |
| `U.wait(ctx, ms)` | 等待，返回 Promise |
| `U.count(el, to, {dur, dec, sep, prefix, suffix, delay, ctx})` | 数字滚动 |
| `U.type(el, {speed, delay, ctx, done})` / `U.scramble(el, {dur, ctx})` | 打字 / 乱码揭示 |
| `U.seg(host, onPick)` | 分段按钮，返回 `set(v)` |
| `U.ring(host, {size, nodes:[{label,color}], active, center, cometDur})` | 环形循环图 |
| `U.orbit(host, {size, core, outer, sats:[{label,color,rx,ry,tilt,dur,phase}]})` | 轨道图（封面） |
| `U.restart(el, cls)` | 重新触发一个 CSS 动画类 |
| `U.qa(host, {single})` | 思考题折叠列表（`.qa > .qa-it > .qa-q + .qa-a > div`），点击展开参考答案；返回 `open(i)` |
| `U.toast(msg)` / `U.copy(text)` / `U.confetti(x, y)` | 提示 / 复制 / 彩带 |
| `U.rand(seed)` | 可复现的随机数 |
| `U.local(el, e)` | 鼠标在 1920×1080 画布内的坐标 |
| `DECK.go(i, k)` / `DECK.next()` / `DECK.cur` | 跳页 |

### 6.3 样式组件（deck.css）

- 容器：`.glass`、`.panel`、`.win` + `.win-bar`（窗口）、`.code`（代码，`.ln` 行、`.ln.hl` 高亮行，`.t-k/.t-s/.t-c/.t-n/.t-p/.t-r/.t-g` 语法色）
- 文字：`.title em`/`.grad`（渐变字）、`.lead`、`.tagline`、`.quote`、`.cap`、`.lbl`、`.muted`、`.dim`
- 标签：`.chip` + `llm/ctx/tool/env/har/ok/bad/warn/acc`；`.badge`（用 `--c` 指定颜色）；`.stamp`（盖章动画，加 `.on`）
- 控件：`.seg`、`.tabs`、`.btn`、`.btn.pri`、`.tgl`、`.rng`、`.chk`、`.flip`、`.runbar`
- 演示件：`.nd`（图节点，`.on/.dim`）、`.fl`（流动连线，`.on/.bad`）、`.ml` + `.mr[data-r=system|tools|user|assistant|tool|status]`（消息列表）、`.meter`（计量条，`--v`）、`.orb`、`.sl`（编号步骤列表，`li.cur/li.done`）
- 入场：`.fx` + `fx-up/down/left/right/scale/pop/blur/flip/zoom`，`--d` 控制先后（每档 90ms）

**语义色全书统一**：LLM / 模型 `--llm`（紫）、上下文 / 观察 `--ctx`（青）、工具 / 行动 `--tool`（琥珀）、环境 `--env`（绿）、Harness `--har`（蓝）、正确 `--ok`、错误 / 风险 `--bad`、警示 `--warn`。

**图标**（`<svg class="ic"><use href="#i-名称"/></svg>`）：upload shield shieldx spark ucheck archive chart file branch check x alert lock unlock search layers book term db users msg list map tag clock help refresh target eye eyeoff zap key pkg edit folder robot user bug flask funnel server link flag copy arrow grid expand left right note compass cpu rocket merge undo code trash play pause gauge home brain wrench globe phone mail bell calendar plane card image mic plug sliders repeat cloud puzzle hourglass scale coin cursor browser mobile wave nodes send star route inbox clipboard ban wand box history chat dice fork cart speaker headphones ear camera video arm gpu trophy medal gift trend pie timer keyboard docs scissors compress thumb tree hier hand crown gavel sprout dna infinity moon sun pin receipt download save commit cube game lang percent sigma compare swap unlink grad dumbbell vector memory bookmark quote cloud2 lightbulb stack network。
不够用时在本章第一个文件开头自建：`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="i-c03-名称" viewBox="0 0 24 24">…</symbol></svg>`（id 带章节前缀）。

### 6.4 画布与坐标

- 画布固定 1920×1080，整体等比缩放。页面内边距 92/130/110：内容区横向 130–1790（宽 1660），标题栏下方大约从 y≈240 开始，主体底部不要超过 y≈990（`.src` 在 y≈1000）。
- 元素位置用 `offsetLeft/offsetTop`（不受缩放影响）；用 `getBoundingClientRect` 要除以 `U.scale`。
- 图示推荐“HTML 节点 + 同尺寸的 SVG 覆盖层”：舞台 `position:relative` 设定宽高，SVG 的 `viewBox` 与舞台像素尺寸一致，连线和数据包就和节点坐标一一对应（样板 `c1-loop`）。

## 7. 已知的坑

1. **`.fx` 占用了 `transition` 和 `transform`**。带 `.fx` 的元素如果再写自己的 `transition`，入场动画会失效；再写 `transform` 会被 `transform:none` 覆盖。做法：外面包一层负责入场；或者状态位移改用独立属性 `translate` / `scale`。
2. 每页的 `<style>` 是全局生效的，选择器必须带本页前缀（`#c03-xxx …` 或本页独有的类名前缀），不要写裸的 `.card`、`.item`。
3. SVG `marker` 里的 `currentColor` 取不到连线的颜色，每种颜色单独定义一个 marker。
4. SVG 元素没有 `.click()`；绑定事件用 `addEventListener`。
5. 用 `U.ring` 的节点 `.node` / `.lab` 带 `data-i`，自己的选择器别和它冲突。
6. 不要用 emoji（字体不统一）；用图标。
7. 字号不小于 15px（检查工具对 < 14px 报警）。
8. 中文排版：中英文之间留空格；数字和单位之间留空格。

## 8. 工作流程

1. 读本规范；浏览 `src/engine/deck.css`、`core.js`、`runtime.js`；精读样板 `src/ch01/*.html`。
2. 通读本章原文、附录里本章的参考答案、`upstream/chapterN/` 下与实验相关的 README（取真实数据）。
3. 写 `storyboard/chNN-plan.md`：分部结构；逐页清单（页面 id、标题、对应原书小节 / 图 / 表 / 实验、演示手法）；确认每个小节、实验、图、表、思考题都有落点。
4. 按部分逐个文件实现。每写完一个文件就跑一遍：`node tools/build.mjs --only chNN && node tools/check.mjs --only chNN && python tools/smoke.py chNN --quick`。
5. 全部写完：`node tools/coverage.mjs chNN`（必须项全部通过，加粗要点 ≥ 85%，未覆盖的逐条在计划文件里说明）；`python tools/smoke.py chNN`（脚本错误必须为 0，布局提示逐条修掉或确认是有意为之并加 `data-ok-overflow` / `data-clip-ok`）。
6. 把 `chapter.json` 的 `ready` 改为 `true`，计划文件更新为最终页面清单。

**进度记录**：计划文件里每个部分标注状态（待做 / 完成）。中途被打断时，后来的人照计划文件接着做。

## 9. 检查工具（全部是非视觉检查，不截图）

| 命令 | 检查内容 |
|---|---|
| `node tools/build.mjs --only chNN` | 构建本章到 `web/chNN.html` |
| `node tools/check.mjs --only chNN` | 脚本语法、页面 id 唯一、钩子与页面对应、data-part 范围、样式里的 #id 存在 |
| `node tools/coverage.mjs chNN` | 对照原书：标题、实验、图、思考题（必须全覆盖）；表头、加粗要点（建议覆盖） |
| `python tools/smoke.py chNN` | 无头浏览器逐页逐步播放并点击交互元素：脚本报错；越出画布、内容被裁切、字号过小 |

## 10. 协作约定（多人并行时）

- 只写自己的 `src/chNN/` 和 `storyboard/chNN-*.md`。不改 `src/engine/`、`src/hub/`、`src/chapters.json`、`tools/`、其他章节。
- 发现引擎缺陷或缺功能：先在本章内用局部代码绕过，在交付说明里写清楚，由统筹的人统一修。
- 不要运行不带 `--only` 的构建（会重写总目录）。

## 参考资料

- 样板：`src/ch01/`（第一章）
- 视觉参照：作者此前做的一份分享会演示 HTML（本地文件，未随仓库发布）——里面有模拟对话、模拟终端、放大镜、粒子漏斗、清单、时间线等交互的写法可以借鉴
- 原书：`upstream/book/`；配套实验：`upstream/chapterN/`
