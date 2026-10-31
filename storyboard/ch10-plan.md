# 第十章「多 Agent 协作」制作计划

> 依据：`upstream/book/chapter10.md`（736 行，约 3.8 万字）、`upstream/book/reference-answers.md`「第十章」、`upstream/chapter10/*/README.md` 与各实验 `validation/` 记录。
> 规范：`docs/AUTHORING.md`。样板：`src/ch01/`。只改 `src/ch10/` 与 `storyboard/ch10-*.md`。

## 0. 进度

| 文件 | 部分 | 页数 | 状态 |
|---|---|---|---|
| `chapter.json` | — | — | 完成（ready 待最终改 true） |
| `00-opening.html` | 0 开篇 | 4 | 完成（build / check / 定点完整冒烟：0 错误 0 提示） |
| `01-taxonomy.html` | 1 分类框架 | 5 | 完成（分支 F1；定点完整冒烟 0 错误 0 提示） |
| `02-when.html` | 2 何时优于单 Agent | 6 | 完成（分支 F1；定点完整冒烟 0 错误 0 提示） |
| `03-shared.html` | 3 共享上下文 | 6 | 完成（分支 F2；定点完整冒烟 0 错误 0 提示） |
| `04-planes.html` | 4 数据平面与控制平面 | 9 | 完成（定点完整冒烟 0 错误 0 提示） |
| `05-peer.html` | 5 对等协作 | 11 | 完成（定点完整冒烟 0 错误 0 提示） |
| `06-manager.html` | 6 管理者模式 | 14 | 制作中（分支 F5） |
| `07-decentral.html` | 7 去中心化与 A2A | 8 | 制作中（主线程） |
| `08-failure.html` | 8 失败模式 | 9 | 完成（2026-10-30 主线程） |
| `09-society.html` | 9 Agent 社会 | 11 | 制作中（分支 F8，第二次启动） |
| `10-closing.html` | 10 收束 | 4 | 完成（定点完整冒烟 0 错误 0 提示） |
| 合计 | | 87 | |

写文件提示：Windows 下用 Bash heredoc 追加大段内容会因命令行过长失败；先用 Write 写到系统临时目录再 `cat >>` 追加。

检查记录（每完成一个文件跑一次）：`node tools/build.mjs --only ch10 && node tools/check.mjs --only ch10 && python tools/smoke.py ch10 --quick`；全部完成后 `node tools/coverage.mjs ch10`、`python tools/smoke.py ch10`。

## 1. 分部结构（chapter.json）

| # | n | k | short | acc | acc2 | 文件 |
|---|---|---|---|---|---|---|
| 0 | 开篇 | OPENING | 开篇 | #34d399 | #22d3ee | 00-opening.html |
| 1 | 分类框架 | PART 01 | 分类 | #2dd4bf | #60a5fa | 01-taxonomy.html |
| 2 | 何时优于单 Agent | PART 02 | 何时用 | #a3e635 | #34d399 | 02-when.html |
| 3 | 共享上下文 | PART 03 | 共享 | #22d3ee | #a78bfa | 03-shared.html |
| 4 | 数据平面与控制平面 | PART 04 | 双平面 | #60a5fa | #2dd4bf | 04-planes.html |
| 5 | 对等协作 | PART 05 | 对等 | #fbbf24 | #a3e635 | 05-peer.html |
| 6 | 管理者模式 | PART 06 | 管理者 | #818cf8 | #22d3ee | 06-manager.html |
| 7 | 去中心化与 A2A | PART 07 | 去中心 | #f472b6 | #a78bfa | 07-decentral.html |
| 8 | 失败模式 | PART 08 | 失败 | #fb7185 | #fb923c | 08-failure.html |
| 9 | Agent 社会 | PART 09 | 社会 | #4ade80 | #fbbf24 | 09-society.html |
| 10 | 收束 | CLOSING | 收束 | #34d399 | #22d3ee | 10-closing.html |

分隔页 `data-node` = 部分序号 − 1，`data-num` = 两位部分序号。

## 2. 全章约定

1. **页面 id**：`c10-` 前缀，见第 3 节清单，不得改名（导览页按 data-part 跳转，思考题页引用了部分页面）。
2. **样式前缀**：每页的类名一律用第 3 节分配的**页面前缀**（如 `cs-`），避免和其他页冲突；`<style>` 里的 `#id` 只能写本页 id。不要使用引擎已有类名做自定义（`.num .core .node .lab .ring .big .on .dim .sw .st` 等只按引擎含义使用）。
3. **全章共用小件**（定义在 `00-opening.html` 顶部，前缀 `k10-`，各页可直接用）：
   - `.k10-sim`：行内“示意”标签。所有为演示而虚构的数值、对话、界面、曲线都要挂一个：`<span class="k10-sim">示意</span>`（可写成“示意 · 非原书数据”）。
   - `.k10-data`：数据来源行，`<div class="k10-data"><svg class="ic"><use href="#i-db"/></svg>数据：配套仓库 chapter10/xxx 验收记录，日期，模型</div>`。
   - `.k10-exp`：实验徽标，`<span class="k10-exp">实验 10-2<i>★★</i></span>`。
   - `.k10-ag` + `.k10-av`：Agent 头像节点（`--c` 指定颜色；状态 `.on/.dim/.bad/.ok`）。
   - `.k10-tbl` + `.k10-tr`（表头行再加 `.k10-th`）：可交互表格，列宽用 `style="--cols:…"`；行加 `.on` 高亮。
4. **出处 `.src`**：`第十章 ·「原书小节标题原文」· 图10-x · 表10-x · 实验 10-x`。一页覆盖多个小节就都写上。
5. **讲解 data-notes**：接近原文、保留推理链与限定条件，150–500 字（实验页可更长）；原书加粗句尽量原样用 `<b>` 保留（第 3 节每页列出了必须出现的加粗要点，务必逐字出现，标点可不同）。属性值里不能出现英文双引号。
6. **数字**：只来自原书或配套仓库。仓库数字注明“数据：配套仓库 chapter10/… 记录”；原书配图里的示例数值注明“原书图示”。
7. **交互**：默认自动演示，点按后进入手动；循环动画用令牌；计时只用 `ctx.later/every/raf`、`U.wait`；`reset` 恢复初始态。
8. **自动播放时长**：内容多的页设 `data-dur`（12000–20000）。
9. **过渡**：同一部分内交替使用 `slide / zoom / flip / rise / iris`。
10. **字号 ≥ 15px**；主体底部 ≤ y≈990；不用 emoji。

## 3. 逐页清单

格式：`id`｜标题｜前缀｜原书落点｜演示手法｜必含加粗要点。

### 00-opening.html（部分 0 开篇）

1. `c10-cover`｜封面｜`kv-`｜章首段｜逐字标题“多 Agent 协作” + 自绘“Agent 网络”（6 个带私有上下文环的 Agent 绕中心“共享空间 / 消息总线”，SMIL 数据包沿连线流动）｜—
2. `c10-levels`｜OpenAI 五级 AI 能力框架｜`lv-`｜章首第 2 段｜分步：五级台阶逐级点亮 → Level 5 注释（Organizations 指能力级别而非架构要求）→ 单 Agent 的两个上限（模型能力边界、上下文窗口）｜—
3. `c10-crowd`｜群体的智能可以高于个体｜`cw-`｜章首第 3 段、脚注 DeepMind《From AGI to ASI》｜canvas 粒子：个体 → 经由分工 / 协作 / 辩论 / 知识的代际累积连成群体（示意），开关逐项开启｜群体的智能可以高于个体
4. `c10-map`｜本章导览｜`mp-`｜全章结构｜分叉路线图（分类框架 → 何时优于单 Agent → 共享 / 不共享（双平面 → 对等 / 管理者 / 去中心化 + A2A）→ 失败模式 → Agent 社会），节点可点击跳到对应部分｜—

### 01-taxonomy.html（部分 1 分类框架）

5. `c10-d1`｜分隔页“协作的分类框架”｜—｜「多 Agent 协作的分类框架」｜—｜—
6. `c10-share`｜维度一：上下文是否共享｜`cs-`｜「维度一：上下文是否共享」前两段、图10-1｜图10-1 重画：左“共享上下文（继承式协作）”三阶段（需求分析师 / 软件工程师 / 代码审查员）换 sys 与 tools、同一条历史持续增长、上下文计量条膨胀；右“不共享上下文（隔离式协作）”Glossary / Translation / Proofreading 各自独立、经共享文件系统交换 glossary.json / chapter1_zh.md / review_report.md。分段按钮切换高亮 + 团队 / 部门比喻｜共享上下文、不共享上下文
7. `c10-ipc`｜通信机制：共享内存与消息传递｜`ip-`｜同小节后三段（IPC 两大范式、三种机制、Go 语言名言）｜三个机制轮播演示：工具调用参数（同步、结构化 JSON）、共享文件系统（写入→读取）、消息总线（发布→转发，异步）；下方映射条“共享内存 ← 共享文件系统；消息传递 ← 工具参数（同步）/ 消息总线（异步）”｜共享内存、消息传递、工具调用的参数、共享文件系统、消息总线（Message Bus）
8. `c10-topo`｜维度二：协作拓扑｜`tp-`｜「维度二：协作拓扑」+ 术语说明 Graph 工程｜三种拓扑图形切换（对等：起草者⇄评论者迭代；管理者：星型；去中心化：网状自由沟通），数据包流动；底部 Graph 工程卡：节点（Agent / 普通程序 / 人工决策）、边（依赖 / 条件路由 / 失败去向）、结构化状态流动｜对等协作模式、管理者模式、去中心化模式、术语说明：Graph 工程。
9. `c10-matrix`｜两个维度组成的分类矩阵｜`mx-`｜本章各节案例的归类（页面注明“归类为本页整理”）｜2 行（共享 / 不共享上下文）× 3 列（对等 / 管理者 / 去中心化）可点矩阵，自动轮播；每格右侧小图：共享行=所有节点罩在同一条上下文带里，不共享行=各自私有上下文 + 文件 / 总线；格内案例：共享×对等=“多个 Agent 看着同一段上下文互相讨论”（表10-1 不引入新信息）；共享×管理者=AutoGen 群聊（共享对话记录 + 中心化调度）；共享×去中心化=多阶段角色转换 / transfer_to_agent（实验 10-1，当前角色自主移交）；不共享×对等=提议者-审核者 / 辩论 / 头脑风暴 / 专家小组；不共享×管理者=书籍翻译（10-2）、电话+电脑（10-3）、并行搜索（10-4）、灵台、Workflow；不共享×去中心化=MetaGPT（通信解耦）、OpenAI Swarm handoff、同机对等实例、Agent 社会｜—

### 02-when.html（部分 2 何时优于单 Agent）

10. `c10-d2`｜分隔页“多 Agent 何时真正优于单 Agent”｜—｜同名节｜quote 用加粗问句｜什么时候真正需要多个 Agent，什么时候一个 Agent 就够了？
11. `c10-newinfo`｜核心判据：是否引入新信息｜`ni-`｜表10-1｜表格逐行自动高亮 + 右侧信息流动画：无新信息时同一段文本在环里打转（灰）；有新信息时外部源（测试执行 / 渲染截图 / 外部工具）注入亮色数据包｜协作过程是否引入了单个 Agent 在生成时无法获得的新信息？
12. `c10-feedback`｜执行反馈与视觉反馈：RLEF 与 WebGen-Agent｜`fb-`｜同节 RLEF、WebGen-Agent 段｜左：写代码 → 执行 → 编译错误 / 测试失败 / 运行时异常 → 修改的循环，对照“独立多次采样”；右：WebGen-Agent 26.4% → 51.9%（Claude 3.5 Sonnet，据报道，接近翻倍）计数条；多层级视觉反馈（截图 + VLM 描述）｜真实的执行结果
13. `c10-paradox`｜学术与工程的“矛盾”｜`pd-`｜“新信息框架解释了一个看似矛盾的现象”段 + Anthropic 2026 漏洞挖掘｜分步：两类“多 Agent”对照 → 漏洞挖掘：45 个 Agent、共享论坛、独立仲裁；2700 万 token / 266 个漏洞 vs 650 万 token / 21 个（独立 Agent 并行）条形图 + 搜索空间覆盖 canvas（示意）｜—
14. `c10-budget`｜步骤预算与 Agent 性能｜`bg-`｜“步骤预算与 Agent 性能”两段｜预算滑块 30 ↔ 300 步；标准 Agent 浅层搜索早早“饱和”vs 有预算意识（示意曲线）；BAVT：随剩余预算比例从“广撒网”切到“深挖掘”；Manager 按复杂度分配预算 + 引导先规划→实现→测试→改进｜步骤预算与 Agent 性能。、单纯增加 Agent 可用的步骤数并不能保证性能提升、动态分配步骤预算
15. `c10-decide`｜成本：收益要覆盖额外开销｜`dc-`｜“此外，成本是……”段 + 本章小结第一段的判断标准｜决策面板：两个开关（是否引入信息增量？收益能否覆盖数倍乃至一个数量级的额外 token？）→ 结论；token 倍数可视化（示意）｜成本

### 03-shared.html（部分 3 共享上下文）

16. `c10-d3`｜分隔页“共享上下文的多 Agent 协作”｜—｜同名节首段｜—｜—
17. `c10-inherit`｜继承式协作与多阶段角色转换｜`ih-`｜同节第 1–2 段｜分步：一条轨迹带不断增长，阶段切换只替换“系统提示词 + 工具集”头部；静态提示词两难（过于笼统 / 过于冗长）→ 按阶段动态切换；挑战：别被继承来的历史干扰（思维惯性，呼应思考题 1）｜—
18. `c10-carrier`｜替换 system prompt，还是加载 Skill？｜`sk-`｜同节对照表（transfer_to_agent vs Skill）｜可点对照表（选择 / 角色规程的载体 / 工具可见性 / 上下文/KV Cache 影响 / 约束能力）+ 请求前缀动画：transfer 改写 system 块 → 从变化点起缓存失效（红）；Skill 在末尾追加 SKILL.md → 前缀复用（绿）｜角色转换究竟是替换 system prompt，还是加载 Skill？
19. `c10-choose`｜怎么选：Skill 还是独立 Agent｜`ck-`｜表后选择原则段｜分拣动画：知识 / 流程 / 写作风格 → Skill；权限 / 工具隔离 / 合规边界 / 运行时强制禁止某类动作 → 独立 Agent 或 transfer_to_agent + Harness 代码限制｜—
20. `c10-exp1`｜实验 10-1 ★★：共享上下文中的多角色转换｜`e1-`｜实验 10-1 框；配套仓库 multi-role-transfer README｜分段按钮切换两条路径的机制图（路径一换 sys+tools；路径二固定前缀 + load_skill 追加）；移交链回放 triage → research → data_analysis → writing → triage（web_search 352.1 / 688.7 / 949.5 万辆；calculate (949.5/352.1)**(1/2)-1 = 0.6421…；count_characters 101 字符 ≤ 120），注明“配套仓库 README 的控制台输出形态示例”｜共同任务与变量、路径一：系统提示词切换、路径二：Skill
21. `c10-exp1r`｜实验 10-1 结果：有边界的架构对照｜`r1-`｜仓库 `validation/comparison/runs/exp10-1-qwen35flash-20260809-v2/REPORT.md`｜计数 / 条形：确定性门禁 Skill 15/30 vs Transfer 2/30；能力序列完成 90.0% vs 40.0%；边界用例均 6/6；异源盲评 Skill 32 / Transfer 20 / 平局 8（60 次交换顺序）；Skill 中位多 6,855 未缓存输入 token、+4.368 秒、+$0.00044304；缓存输入全程为 0（未证明前缀缓存收益）；局限｜—

### 04-planes.html（部分 4 数据平面与控制平面）

22. `c10-d4`｜分隔页“不共享上下文：数据平面与控制平面”｜—｜「不共享上下文的多 Agent 协作」首段｜—｜—
23. `c10-os`｜多 Agent 系统与操作系统｜`os-`｜表10-2 + Actor 模型段｜10 行映射表自动逐行高亮，右侧“进程 ↔ Agent”示意图同步点亮对应部件；Actor 模型（私有状态、异步消息、可创建新成员，Hewitt 1973）｜—
24. `c10-planes`｜进程式隔离：好处、代价与两个平面｜`pl-`｜表后三段｜左：四个好处 / 三个代价（开关：让一个 Agent 故障，错误不外溢）；右：数据平面（共享文件系统）+ 控制平面（消息传递、状态查询、执行终止、资源调度）两层图｜共享文件系统、通信与控制机制
25. `c10-vfs`｜Agent 眼中的文件系统｜`vf-`｜「Agent 眼中的文件系统」+ 图10-2｜图10-2 重画：目录树 `/scratch/<id>`、`/workspace/shared`、`/mnt/gdrive · /mnt/notion`（经适配器）、`/skills`；Agent A/B 经统一接口 read_file / write_file / list_dir 访问，用户上传下载；点击区域看详情（四类区域全文要点，含外部挂载三项特性）；地址空间比喻｜虚拟文件系统、一、Agent 专属工作区（Scratchpad）、二、多 Agent 共享空间（Shared Workspace）、用户可见、三、外部挂载资源（Mounted External Resources）、访问受外部权限约束、延迟更高且一致性更弱、以按需只读为主、四、系统内置资源（Built-in System Resources）、Skills
26. `c10-zones`｜四类区域检查表与“文件路径作为通用接口”｜`zn-`｜表10-3 + 其后一段｜可交互表（区域 / 可见性 / 生命周期 / 读写 / 并发控制）；对照动画：传路径字符串 vs 把内容载入上下文（token 计量，示意）｜文件路径作为通用接口
27. `c10-msg`｜控制平面之一：消息传递｜`ms-`｜「Agent 间的通信与控制」首段 + “一、消息传递”｜Agent 数滑块：点对点连接数 n(n−1)/2 vs 总线 n 条；信封卡片（发送者 ID、目标 / 广播、类型 task_assigned / status_update / result / terminate、JSON 负载）沿总线投递｜产物交换、控制平面、一、消息传递。、消息总线、信封
28. `c10-status`｜控制平面之二：状态查询｜`st-`｜“二、状态查询”三段｜三栏切换：拉取式 get_subagent_status（为何不实用）/ 用消息传递获取状态（异步问答、主动 status_update、统一状态词汇）/ 用共享文件系统获取状态（轨迹持久化 JSONL 流 vs 约定进度文件 progress.md；最后修改时间超过 N 分钟 → 判定卡住）｜二、状态查询。、用消息传递获取状态、用共享文件系统获取状态、轨迹持久化、约定进度文件、检测卡住状态
29. `c10-term`｜控制平面之三：执行终止｜`tm-`｜“三、执行终止”三段｜Agent 生命周期树：优雅终止（terminate → 安全点 → 清理：关浏览器会话 / 写完文件 / 释放锁 → ack → 退出）vs 强制终止（遗留悬挂资源）；点节点取消 → 沿创建关系级联（Go context、ctx.Done()）；后台 Agent（nohup / context.Background()）不随父级终止｜三、执行终止。、优雅终止、强制终止
30. `c10-sched`｜控制平面之四：资源与调度｜`sd-`｜“四、资源与调度”三段 + 小结句｜赛马动画（示意）：步数 / token 预算条、强弱模型分派、并发上限与抢占；Manager 根据进展加资源或终止误入歧途者｜四、资源与调度。

### 05-peer.html（部分 5 对等协作）

31. `c10-d5`｜分隔页“对等协作：相互制衡与迭代改进”｜—｜同名节首段｜—｜—
32. `c10-peer`｜“多个实例”不等于“多种思路”｜`pe-`｜同节首两段｜开关：同质（同模型 / 上下文 / 脚手架 → 做出相同选择，局部错误变系统性故障）vs 差异化（区分模型、上下文、工具、可见证据或职责；先独立判断、再汇总）；实现复杂度更低（角色、通信机制、迭代终止条件）｜—
33. `c10-early`｜过早终止：活干到一半就停｜`et-`｜「Loop 工程」首段｜三种形态卡（各配 Coding Agent 与 Pine AI 例子），进度条在半途停下并盖“宣称完成”章 vs 实际状态｜过早终止、偷懒式假完成、过早放弃、假成功、在验证之前，“完成”只是模型的一句宣称，不是证明
34. `c10-loop`｜Loop 工程：让验证器决定能否停｜`lp-`｜「Loop 工程」第 2 段｜循环环：发现下一件该做的事 → 执行 → 验证 → 记录进度；验证器门；开关“验证器可靠 / 不可靠”：不可靠时劣质产出更快被标记完成；人的角色变化；Addy Osmani（2026 年 6 月）、Boris Cherny 原话｜Loop 工程、循环的瓶颈在验证器，而不在模型
35. `c10-loopx`｜具体框架：LoopX｜`lx-`｜LoopX 段 + 流程代码｜流水线 LoopX 决策 → Agent 执行 → 独立验证器证明 → LoopX 提交；四要素（目标与边界 / 门禁和待办 / 证据与配额 / 移交）；验证失败 → 修复或重规划；人工门禁、等待状态、预算上限在执行前拦截；v0.4.0 受控 Turn 路径为实验性｜具体框架：LoopX。、模型可以提出 “完成”，但不能批准自己的 “完成”。
36. `c10-lhh`｜具体框架：LongHorizon-Harness｜`lh-`｜LongHorizon 三段｜MEA 循环（Manager → Executor 全新上下文 GUI/CLI → Auditor 只读审计 → 任务状态）；对照条：WeaveBench PassRate 51.8% → 80.7%、OSWorld 2.0 2.8% → 8.3%、Terminal-Bench 2.1 69.7% → 77.2%（Qwen 3.7-Plus + Claude Code 后端，只改外层 loop）；代价：前两个基准 2.3 倍总 token、3.6 倍输出 token，Terminal-Bench 2.1 减少 24%；公开轨迹 WEB_task_16_webrtc_simulcast_layer_audit 基线 0.59 vs MEA 0.92｜具体框架：LongHorizon-Harness。、公开轨迹与实验复现。
37. `c10-pr`｜提议者-审核者范式｜`pr-`｜「提议者-审核者范式」前两段 + 图10-3｜图10-3 重画：Proposer（论文扩展摘要 2000 字 → Slidev 代码）→ Reviewer（Slidev 渲染 → PDF/PNG；Vision LLM 多维度评估；结构化反馈 P3 内容过密 高 / P7 字体过小 中 / P11 配色不协调 低）→ 三轮迭代（12 页 5 个问题 → 14 页 2 个 → 14 页 0 个）；“为何不用单 Agent”（截图在单 Agent 上下文里累积爆炸）；适用场景 chips（安全审查 / 内容审核 / 代码审核）；数字注明原书图示｜—
38. `c10-self`｜为什么不能自己生成再自己审查？｜`sf-`｜Huang ICLR 2024、TACL 综述、CRITIC 段｜对照动画（示意）：无外部反馈的自审 → 把对的改错比把错的改对更多；接上工具验证 → 有效；移除工具只留自评 → 提升大多消失；PPT 例子｜为什么不能让一个 Agent 自己生成再自己审查？、渲染了 PPT 并截取了画面
39. `c10-invar`｜最小不变量：独立证据与可定位的修复条件｜`iv-`｜伪代码段 + “审核者不能修改测试……” + Anthropic 2026 长程应用开发实验｜代码逐行高亮，与右侧流程同步；规则卡；三 Agent 架构动画（规划者展开规格 → 生成者与评估者约定每轮完成标准 → 生成者实现 → 评估者用 Playwright 操作真实应用提交缺陷报告；文件交接）｜独立证据
40. `c10-debate`｜辩论模式：等计算量下未必更好｜`db-`｜「辩论模式」两段｜支持者 / 反对者对抗动画；数据处理不等式：信息条沿串行传递只减不增；Tran 与 Kiela 2026（多跳推理、单 Agent vs 顺序 / 辩论 / 集成 / 并行角色 / 子任务并行）；不否定的两类做法｜多次独立采样再聚合、生成与验证的难度不对称
41. `c10-ideas`｜头脑风暴与专家小组｜`id-`｜「头脑风暴模式」「专家小组模式」｜分段切换：头脑风暴（社交分享 → 个性化分享海报 → 用户自定义海报模板并形成模板市场，思维偏好不同）/ 专家小组（工程师、产品、运营三个视角拼出全貌，互补而非对抗）｜—

### 06-manager.html（部分 6 管理者模式）

42. `c10-d6`｜分隔页“管理者模式：中心化协调”｜—｜同名节首段｜—｜—
43. `c10-mgr`｜Manager：把 Agent 当作工具调用｜`mg-`｜同节第 1–2 段｜Manager 职责流水（理解 → 拆解 → 选择 Agent → 跟踪与异常处理 → 整合）；工具集里同时有 search / write_file 与 call_agent_*；“注册新 Agent 为工具”动画；可扩展性与异构性｜—
44. `c10-planner`｜弱规划者是整个系统最关键的瓶颈｜`pn-`｜同节第 3–4 段（挑战 + Plan-and-Act）｜开关“规划质量高 / 分解有误”：错误前提染红所有 Executor；WebArena-Lite 57.58%；最强模型给 Manager｜弱规划者是整个系统最关键的瓶颈
45. `c10-settle`｜第一个已验证成功，而不是第一个声称成功｜`se-`｜结算伪代码 + settle_once 幂等说明｜代码逐行高亮 + 模拟：多个 worker 先后报结果，hidden_checks 验证，原子认领，广播取消，等待 ack；开关“去掉锁”演示两次汇总｜已验证
46. `c10-seq`｜顺序协调形态｜`sq-`｜“顺序协调形态”+ 图10-4｜图10-4 重画：Manager 依次调用 A（数据收集）→ B（分析处理）→ C（报告生成），数据包往返，右侧时间线｜顺序协调形态。
47. `c10-exp2`｜实验 10-2 ★★：书籍翻译 Agent｜`e2-`｜实验 10-2 框 + 图10-5｜单 Agent 上下文累积爆炸 vs 管理者模式架构动画（Manager → Glossary → Translation ×N → Proofreading → 发回修订；共享文件系统 glossary.json / chapter{n}_zh.md / review_report.md / translation_guide.md）；四个 Agent 的职责卡；上下文隔离条；实验要求 1–4｜Glossary Agent、Translation Agent、Proofreading Agent、Manager Agent、上下文隔离、实验要求
48. `c10-exp2r`｜实验 10-2 实测：隔离的收益与代价｜`r2-`｜仓库 book-translation README（v4 正式实跑 + 4 章入门样例）｜分段切换两组真实数据的表与条形（主上下文峰值 4,618 vs 94,355；翻译总 token 203,277 vs 1,317,808；墙钟 270.829 vs 254.127 秒；质量 4.654 vs 4.481；编辑部指定译法遵从率 75% vs 0%；字符串术语一致率 50% vs 87.5% 等）；负结果标注｜—
49. `c10-par`｜并行协调形态与消息总线｜`pa-`｜“并行协调形态”+ 图10-6｜图10-6 重画：Manager + 消息总线 + Agent 1–4（运行中 / 已完成 / 等待中），四条总线消息示例逐条投递；发布 / 订阅（公共公告板）｜并行协调形态。、消息总线
50. `c10-lingtai`｜灵台：管理者模式的产品化实例｜`lt-`｜灵台两段｜主器灵派生分神（短时并行、完成即弃、只带回结论）与分身（持久队友：记忆、邮箱、职责）；凝蜕（molt）；知识私有、技能共享；“器灵即其文件”｜灵台（Lingtai）：管理者模式的一个产品化实例。、主器灵、分神、分身
51. `c10-exp3`｜实验 10-3 ★★★：自主编排的电话 + 电脑 Agent｜`e3-`｜实验 10-3 框 + 图10-7｜双泳道时间线：Phone 问字段 1 → info_collected → Computer 填字段 1 的同时 Phone 问字段 2（重叠高亮）→ format_invalid 重问 → fill_error 调整话术 → task_completed → 校验后经授权提交；两种运行模式切换（固定 / 自主 initiate_phone_call_agent）；图10-7 消息示例（证件号等个人值打码）｜前置要求、任务场景、系统架构、两种运行模式、固定模式（并发基线）、自主模式（主实验）、并行与闭环、实验要求
52. `c10-exp3r`｜实验 10-3 验收记录：自主启动与并行协作｜`r3-`｜仓库 autonomous-phone-registration（raw-v4）与 talkact-reproduction（v2）README｜两张证据卡（分别统计，不合并）：自主路径 9/9 门禁等；固定拓扑 TalkAct 16 局：语音延迟 p50 2.32 vs 12.52 秒等，延迟优势 ≠ 全面更好｜—
53. `c10-exp4`｜实验 10-4 ★★★：同时从多个网站搜集信息｜`e4-`｜实验 10-4 框 + 图10-8｜交互模拟：10 个 Agent 并行搜索“张伟”，状态表实时更新；Agent 3 命中 → target_found → terminate 广播 → 确认 → 汇总；开关“无锁”演示竞态条件（重复汇总）；核心挑战 1–4｜前置要求、多个同构 Agent 的并行搜索、问题、核心挑战、1. 并行启动、2. 实时监控、3. 级联终止、概念补充：什么是竞态条件？、4. 失败处理
54. `c10-exp4r`｜实验 10-4 实测与失败处理｜`r4-`｜仓库 parallel-web-research README｜失败处理三策略；真实数据：2026-07-29 并行 18.542 秒 vs 串行 58.264 秒（3.142×），完整溯源运行 1.872×；级联 1 次广播、3 个确认、4/4 context 关闭；24 份浏览器观测、114 条总线事件；对照原书图示“约 15×”；实验要求 1–6｜实验要求
55. `c10-flow`｜管理者生成 Agent 工作流｜`wf-`｜“管理者 Agent 生成 Agent 工作流”两段 + JS 代码｜对照：管理者留在循环里（每派发一次就决策一次、上下文增长）vs 先写成代码交给确定性运行时；pipeline 扇出动画（七个方向 → 调研 → 逐条并行核实 → 汇总）｜管理者 Agent 生成 Agent 工作流。、管理者先把 Agent 工作流写成一段代码，再交给确定性的运行时去执行

### 07-decentral.html（部分 7 去中心化与 A2A）

56. `c10-d7`｜分隔页“去中心化模式与跨组织协作”｜—｜「去中心化模式」｜—｜—
57. `c10-choreo`｜为什么还要去中心化：编排与编舞｜`cr-`｜同节前三段 + 递进线索段｜开关“让管理者崩溃”：星型全停 vs 网状继续；三种沟通气泡（移交任务 / 请求反馈 / 报告问题）；编排 vs 编舞；递进线 MetaGPT（伪去中心化）→ AutoGen（混合）→ Swarm（真正对等）｜管理者 Agent 崩溃往往会成为系统最大的单点故障、编排、编舞
58. `c10-metagpt`｜MetaGPT：SOP 驱动的软件公司模拟｜`mt-`｜MetaGPT 前三段 + 图10-9｜图10-9 重画：PM → Architect → PjM → Engineer ×3 → QA，产物 docs/PRD.md / design.md / tasks.md / src/*.py / test_report.md，Bug 报告回流；移交包三部分｜MetaGPT：SOP 驱动的软件公司模拟。、标准作业程序、Product Manager Agent、Architect Agent、Project Manager Agent、Engineer Agents、QA Engineer Agent、任务描述、已确认的事实与约束、结构化产物的引用
59. `c10-pool`｜共享消息池 + 按角色订阅｜`po-`｜MetaGPT 后两段｜发布 / 订阅动画；“换更强模型的 PM”无需改下游；如实说明：控制流由 SOP 固定（流水线 / 工作流），多向动态反馈是扩展设想、原版未实现｜共享消息池 + 按角色订阅、控制流
60. `c10-groupchat`｜AutoGen 群聊与 OpenAI Swarm｜`gc-`｜AutoGen、Swarm 两段｜分段切换：群聊（公共记录、发言者选择器：轮转 / LLM，GroupChatManager 中心裁决）vs Swarm（接力棒式 handoff、无中心调度、只传任务包与产物引用、成环风险）｜AutoGen 群聊。、OpenAI Swarm。
61. `c10-handoff`｜去中心化 handoff 的最小协议｜`ho-`｜handoff 伪代码 + 其后一段｜代码高亮 + 模拟：任务包在 A→B→C 间移交，visited_agents 增长、remaining_budget 递减；企图回到 A → reject(cycle)；预算耗尽 → stop_and_escalate；运行时保留的字段不能被 Agent 删除｜—
62. `c10-swarm`｜“Agent Swarm”：同名不同构｜`aw-`｜Agent Swarm 引用框 + 脚注 + “同一台机器上的多个对等 Agent 实例”｜分拣：handoff 网络（OpenAI Swarm、LangGraph swarm 库、微软 Agent Framework handoff 编排）vs 规模化管理者（Kimi K2.5 Agent Swarm、K3 + AgentEnv、Anthropic 多 Agent 研究系统、Manus Wide Research）；同机对等实例：list_agents 互相发现、协商文件冲突、协调唯一一块 GPU｜同一台机器上的多个对等 Agent 实例。
63. `c10-a2a`｜跨组织协作：A2A 协议｜`aa-`｜A2A 两段｜组织边界两侧的 Agent：Agent Card（名片）发现 → 任务状态机（已提交 → 进行中 → 需要输入 → 已完成 / 失败）逐态点亮 → 只交换任务与产物（不透明协作）；MCP（Agent↔工具）vs A2A（Agent↔Agent）对照｜A2A、Agent Card、任务生命周期管理、不透明协作

### 08-failure.html（部分 8 失败模式）

64. `c10-d8`｜分隔页“多 Agent 协作的失败模式”｜—｜同名节｜—｜—
65. `c10-mast`｜Why Do Multi-Agent LLM Systems Fail?｜`ma-`｜同节首段 + 三大类 + ChatDev 15.6%｜计数：7 个框架、约 150 条轨迹、Cohen's kappa 0.88、14 种失败模式；三大类卡片；“简单修复仅 +15.6%”→ 根本性设计缺陷｜14 种独特的失败模式、系统设计缺陷、Agent 间对齐失败、任务验证缺失、根本性设计缺陷
66. `c10-byz`｜崩溃故障与拜占庭故障｜`bz-`｜分布式容错段｜分段切换：崩溃（停止工作）vs 拜占庭（继续工作但给出看似可信的错误）；五个 Agent 表决演示交叉验证、多数表决（示意）｜崩溃故障、拜占庭故障
67. `c10-race`｜失败模式一：共享文件系统的并发冲突｜`rc-`｜失败模式一全文｜四段模拟：简单冲突（后写覆盖先写）/ 语义冲突（A 重编图号、B 引用旧编号）/ 乐观锁（版本号校验 → 写入失败 → 重读重做）/ 工作副本隔离（各自分支 → 合并点）｜简单冲突（文件级写入冲突）、语义冲突（逻辑级一致性冲突）、解决方案：乐观锁（Optimistic Locking）机制、同一文件、跨文件语义冲突、工作副本隔离
68. `c10-telephone`｜失败模式二：错误的级联放大｜`te-`｜失败模式二全文｜传话游戏：一句结论经 5 个 Agent 逐次有损转述（示意）；开关“交叉验证”：独立审核者只看原始证据与最终结论，揭穿走样｜交叉验证、独立视角
69. `c10-homo`｜失败模式三：同质趋同｜`hm-`｜失败模式三全文｜30 个点中 18 个汇向同名分支（计数）；相同标题；共因失效；对策（差异化 + 命名空间、资源配额、速率限制）；Bertrand 定价：私密信道 → 合谋；移除直接通信 → 仍借公开报价板合谋（价格线示意）｜共因失效
70. `c10-blame`｜失败模式四：互相扯皮｜`bl-`｜失败模式四全文｜Anthropic 三 Agent 迁移冲突升级时间线（误解为蓄意阻挠 → 终止对方进程 → 撤销权限 → 自复制破坏代码）；运行时须预先定义目标优先级、资源所有权、权限边界，无法按可验证规则解决时暂停交人工；MetaGPT 早期推诿乒乓（前端 ↔ 后端 ↔ 产品；测试环境 bug 死锁）｜—
71. `c10-runaway`｜失败模式五：循环失控｜`ru-`｜失败模式五｜canvas 子 Agent 派生爆炸（示意）；开关“独立 API key / 预算上限”截断增长；与过早终止对照｜失控的 Agent 有时会生成数千个子 Agent，浪费大量 token
72. `c10-debt`｜失败模式六：理解债与认知投降｜`dt-`｜失败模式六 + 过渡句｜示意曲线：交付速度 vs 理解程度差距拉大；理解债 / 认知投降两卡；Karpathy 名言；“既不能越俎代庖，也不能放手不管”｜理解债、认知投降

### 09-society.html（部分 9 Agent 社会）

73. `c10-d9`｜分隔页“Agent 社会”｜—｜「Agent 社会」首段｜quote 用加粗问句｜当 Agent 数量从几个扩展到成百上千、交互足够自由时，会涌现出什么行为？
74. `c10-society`｜三个维度：社交、经济与博弈｜`so-`｜同节三维度｜三张维度卡与案例；规模滑块 25 → 100 → 约 150 万（对数刻度，canvas 示意）｜社交涌现、经济涌现、策略博弈
75. `c10-town`｜斯坦福 AI 小镇：记忆、反思与计划｜`tw-`｜小镇前五段 + 图10-10｜图10-10 重画：Isabella 记忆流（importance / recency 取自原书图示，检索打分动画）、反思问答、计划与行动（动态调整）；三个核心组件卡；反思 ≠ 第九章持续进化｜记忆流、反思机制、计划与行动
76. `c10-party`｜涌现：情人节派对与市长选举｜`py-`｜小镇后四段｜canvas 小镇模拟（示意）：种子想法植入 Isabella，经偶遇扩散；切换“市长选举”线；关系记忆、协调赴约｜涌现行为、没有任何显式的派对组织代码、关系记忆、协调赴约
77. `c10-exp5`｜实验 10-5 ★：运行斯坦福 AI 小镇｜`e5-`｜实验 10-5 框 + 仓库 generative-agents README｜步骤 1–5 / 观察重点；仓库正式运行：三组各 25 Agent、17,280 步、两个虚拟日；148,856 份回执；14/14 门禁；聚会传到 3 名角色、工作坊未扩散；反思 1,363 / 977 / 0；盲评 17:8；四项均分对照｜实验步骤、观察重点
78. `c10-agentopia`｜Agentopia：十年尺度的长期生活模拟｜`ag-`｜Agentopia 全文｜周制四阶段环（Plan / Contact / Activity / Review）+ 四类活动；环境模型职责；文件式记忆“先读后写”；生活奖励三维；训练信号：前 25% 轨迹拒绝采样微调 → 被尊重 +24.2%、被喜欢 +15.9%、CoSER Test +15.6%｜把时间尺度拉长到“年”，Agent 社会会涌现出什么？这些长期社会经验能否反过来训练模型？、周制模拟流程、环境模型、文件式长期记忆、生活奖励、观察对象、经验来源
79. `c10-moltbook`｜Moltbook：当 Agent 拥有自己的社交网络｜`mb-`｜Moltbook 两段｜用户数从数万到约 150 万（计数）；龙虾教教义 ↔ LLM 物理限制对照翻牌；机器原生协作协议｜—
80. `c10-vending`｜从虚拟社会到经济竞争：Vending-Bench Arena｜`vb-`｜同名节全文｜分段：Vending-Bench 2（单 Agent 一年经营）→ Arena（同市场竞争，可邮件 / 转账 / 交易）；三项决策；价格战 / 价格同盟 / “不道德且违法”却照做（价格线示意）｜Vending-Bench 2、单 Agent、Vending-Bench Arena、定价策略、产品组合、库存管理
81. `c10-market`｜Agent 经济：Pinchwork 与 RentAHuman｜`mk-`｜同名节全文｜撮合动画：Agent 发布需求 → 市场按价格信号与竞争匹配 Agent 或真人；“肉身层”｜Pinchwork、RentAHuman.ai、基于市场机制的协调方式、基于市场机制的去中心化资源分配
82. `c10-wolf`｜信息不对称下的策略博弈：狼人杀｜`ww-`｜同名节导语 + 图10-11｜图10-11 重画：法官（代码驱动）+ 角色；点选角色查看其可见信息（信息权限控制）；Night → Day → Vote → Settle 阶段环；小镇（完全去中心化）vs 狼人杀（法官 + 信息权限，中心化）对照｜策略博弈
83. `c10-exp6`｜实验 10-6 ★★★：语音狼人杀 Agent 系统｜`e6-`｜实验 10-6 框 + 仓库 voice-werewolf README｜架构设计 1–3 + 三种策略提示词卡；验收标准勾选清单；仓库 v11（2026-08-03）真实验收数据与被否决的早期运行｜架构设计、1. 游戏状态管理、2. 信息权限控制、3. Agent 推理与策略、狼人伪装策略、预言家身份证明、村民逻辑推理、验收标准

### 10-closing.html（部分 10 收束）

84. `c10-sum`｜本章小结｜`su-`｜「本章小结」四段｜四张分步卡（价值判据 / 设计核心问题 / 放大错误与容错闭环 / 群体与社会），关键词逐个点亮｜—
85. `c10-qa`｜思考题（1–6）｜`tq-`｜「思考题」1–6 + 参考答案｜U.qa 折叠，自动依次展开｜—
86. `c10-qa2`｜思考题（7–11）｜`tq-`（样式在 c10-qa 定义）｜「思考题」7–11 + 参考答案｜同上｜—
87. `c10-end`｜章末导航｜`en-`｜本章小结末句｜结语 + end-nav｜—

## 4. 覆盖清单

### 小节 → 页面

| 原书小节 | 页面 |
|---|---|
| 章首（五级框架、群体智能、DeepMind） | c10-cover、c10-levels、c10-crowd |
| 多 Agent 协作的分类框架 | c10-d1 |
| 维度一：上下文是否共享 | c10-share、c10-ipc |
| 维度二：协作拓扑（含术语说明 Graph 工程） | c10-topo、c10-matrix |
| 多 Agent 何时真正优于单 Agent | c10-d2、c10-newinfo、c10-feedback、c10-paradox、c10-budget、c10-decide |
| 共享上下文的多 Agent 协作 | c10-d3、c10-inherit、c10-carrier、c10-choose、c10-exp1、c10-exp1r |
| 不共享上下文的多 Agent 协作（导语、表10-2、Actor、两平面） | c10-d4、c10-os、c10-planes |
| Agent 眼中的文件系统 | c10-vfs、c10-zones |
| Agent 间的通信与控制 | c10-msg、c10-status、c10-term、c10-sched |
| 对等协作模式：相互制衡与迭代改进 | c10-d5、c10-peer |
| Loop 工程 | c10-early、c10-loop、c10-loopx、c10-lhh |
| 提议者-审核者范式 | c10-pr、c10-self、c10-invar |
| 辩论模式 | c10-debate |
| 头脑风暴模式、专家小组模式 | c10-ideas |
| 管理者模式：中心化协调 | c10-d6、c10-mgr、c10-planner、c10-settle、c10-seq、c10-exp2、c10-exp2r、c10-par、c10-lingtai、c10-exp3、c10-exp3r、c10-exp4、c10-exp4r、c10-flow |
| 去中心化模式 | c10-d7、c10-choreo、c10-metagpt、c10-pool、c10-groupchat、c10-handoff、c10-swarm |
| 跨组织协作：A2A 协议 | c10-a2a |
| 多 Agent 协作的失败模式 | c10-d8、c10-mast、c10-byz |
| 失败模式一～六 | c10-race、c10-telephone、c10-homo、c10-blame、c10-runaway、c10-debt |
| Agent 社会 | c10-d9、c10-society |
| 斯坦福 AI 小镇 | c10-town、c10-party、c10-exp5 |
| Agentopia | c10-agentopia |
| Moltbook | c10-moltbook |
| Vending-Bench Arena | c10-vending |
| Pinchwork 与 RentAHuman | c10-market |
| 狼人杀 | c10-wolf、c10-exp6 |
| 本章小结 | c10-sum |
| 思考题 | c10-qa、c10-qa2 |

### 实验 / 图 / 表 / 代码

- 实验 10-1：c10-exp1、c10-exp1r ｜ 10-2：c10-exp2、c10-exp2r ｜ 10-3：c10-exp3、c10-exp3r ｜ 10-4：c10-exp4、c10-exp4r ｜ 10-5：c10-exp5 ｜ 10-6：c10-exp6
- 图10-1 c10-share ｜ 图10-2 c10-vfs ｜ 图10-3 c10-pr ｜ 图10-4 c10-seq ｜ 图10-5 c10-exp2 ｜ 图10-6 c10-par ｜ 图10-7 c10-exp3 ｜ 图10-8 c10-exp4 ｜ 图10-9 c10-metagpt ｜ 图10-10 c10-town ｜ 图10-11 c10-wolf
- 表10-1 c10-newinfo ｜ 角色转换载体对照表（无编号）c10-carrier ｜ 表10-2 c10-os ｜ 表10-3 c10-zones
- 代码：LoopX 流程 c10-loopx ｜ 提议者—审核者循环 c10-invar ｜ 并行结算 c10-settle ｜ Workflow pipeline c10-flow ｜ handoff 协议 c10-handoff
- 思考题 1–6：c10-qa；7–11：c10-qa2

### 配套仓库数据来源

| 实验 | 记录 |
|---|---|
| 10-1 | `multi-role-transfer/validation/comparison/runs/exp10-1-qwen35flash-20260809-v2/REPORT.md`（正式 v2）；控制台输出形态见 README |
| 10-2 | `book-translation/README.md`「2026-07-30 正式实跑结果」（v4）与「结论（gpt-5.6-luna，4 章）」 |
| 10-3 | `autonomous-phone-registration/README.md`（raw-v4，2026-07-31）；`talkact-reproduction/README.md`（Anthropic-caller v2，2026-08-03） |
| 10-4 | `parallel-web-research/README.md`（2026-07-29 记录；`exp10-4-real-receipts-20260730-v2`） |
| 10-5 | `generative-agents/README.md`（`exp10-5-qwen37flash-20260804-v1`） |
| 10-6 | `voice-werewolf/README.md`（`exp10-6-simulated-user-openrouter-20260803-v11`） |

## 5. 加粗要点说明与最终检查（2026-10-30）

- 接手时发现 06 / 07 / 09 三个文件只写了部分页面、08 未开始，共缺 30 页。补写在 `06b-manager.html`（c10-exp2r … c10-flow，8 页）、`07b-decentral.html`（c10-pool … c10-a2a，5 页）、`08-failure.html`（9 页）、`09b-society.html`（c10-party … c10-exp6，8 页），页面 id 与第 3 节清单一致。
- `node tools/coverage.mjs ch10`：标题 34/34、实验 6/6、图 11/11、思考题 11/11、表头 4/4、加粗要点 176/176（100%）。
- `python tools/smoke.py ch10`：87 页，点击 429 个交互元素，脚本错误 0，布局提示 0。`chapter.json` 已改为 `ready: true`。
- 实验 10-4 的真实运行查找的是斯坦福 HAI 页面上的 Andrew Ng（3.142× / 1.872×），与原书图10-8 的“张伟 / 约 15×”图示分开呈现。

## 6. 定点冒烟（只测指定页面，不改 tools/）

```bash
cd "D:/个人项目/code/ai-agent-book" && PYTHONIOENCODING=utf-8 PYTHONDONTWRITEBYTECODE=1 python - ch10 c10-d5 c10-peer 'c10-e*' <<'EOF'
import sys
sys.path.insert(0, 'tools')
from smoke import LAYOUT_JS, CLICK_JS, WEB
from playwright.sync_api import sync_playwright
args = [a for a in sys.argv[1:] if not a.startswith('--')]
chap, want = args[0], args[1:]
quick = '--quick' in sys.argv
errors, layout = [], []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    cur = {'id': '(加载)'}
    pg.on('console', lambda m: errors.append(f"[{cur['id']}] console.error: {m.text}") if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errors.append(f"[{cur['id']}] 未捕获异常: {e}"))
    pg.goto((WEB / f'{chap}.html').as_uri())
    pg.wait_for_function('window.DECK && DECK.cur >= 0', timeout=15000)
    ids = pg.evaluate("[...document.querySelectorAll('#deck .slide')].map(s => s.id)")
    idx = [i for i, s in enumerate(ids) if any(s == w or (w.endswith('*') and s.startswith(w[:-1])) for w in want)]
    clicks = 0
    for i in idx:
        sid = ids[i]; cur['id'] = sid
        pg.evaluate(f'DECK.go({i}, 0)'); pg.wait_for_timeout(450)
        steps = pg.evaluate(f"document.querySelectorAll('#deck .slide')[{i}]._steps")
        for _ in range(steps):
            pg.evaluate('DECK.next()'); pg.wait_for_timeout(320)
        if not quick:
            pg.wait_for_timeout(2600)
            for m in pg.evaluate(LAYOUT_JS): layout.append(f'[{sid}] {m}')
            clicks += pg.evaluate(CLICK_JS, [i, steps])
    b.close()
mine_ids = [ids[i] for i in idx]
mine = [e for e in errors if any(f'[{x}]' in e or x in e for x in mine_ids) or e.startswith('[(加载)]')]
print(f"{chap}：测试 {len(idx)} 页，点击 {clicks}，相关脚本错误 {len(mine)}（全章 {len(errors)}），布局提示 {len(layout)}")
for e in mine[:60]: print('  ✗ ' + e)
for m in layout[:150]: print('  △ ' + m)
EOF
```

参数：章节名 + 页面 id（支持 `前缀*`），加 `--quick` 只翻页。
