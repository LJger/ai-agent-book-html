# 深入理解 AI Agent · 动画版

把李博杰《深入理解 AI Agent：设计原理与工程实践》（[bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book)）做成交互式动画演示：一章一个独立 HTML，由总目录串联，内容深度与原书一致。非官方二次创作，版权说明见 [NOTICE.md](NOTICE.md)。

## 打开方式

双击 `web/index.html`（总目录），点击章节卡片进入。每个文件都可以单独打开，不需要联网，也不需要本地服务器。

| 操作 | 作用 |
|---|---|
| → / 空格 / 滚轮 | 下一步（先走完本页的分步，再翻页） |
| ← | 上一步 |
| P | 自动播放 / 暂停（右下角按钮外圈显示倒计时） |
| N | 显示讲解（原书深度的完整讲述） |
| O | 本章目录 |
| 0–9 | 跳到对应部分 |
| F | 全屏 |
| 页面里的卡片、按钮、开关、滑块 | 都可以点：切换对照、注入故障、调参数 |

网址末尾的 `#/页码/步骤` 可以直达某一页；总目录会记住上次看到的位置（浏览器允许本地存储时）。

## 目录

```
web/                 构建产物：index.html（总目录）+ ch00.html … ch11.html
src/
  engine/            共用引擎：页面外壳、样式、运行时、图标
  hub/               总目录页
  chapters.json      全书章节清单
  chNN/              各章源码：chapter.json + 按播放顺序排列的页面文件
docs/AUTHORING.md    制作规范（结构约定、内容要求、引擎接口、检查流程）
storyboard/          各章计划与页面清单
tools/               构建与检查脚本
upstream/            原书仓库的只读副本（不纳入版本管理）
archive/             早期弃用的版本
```

`upstream/` 缺失时重新克隆：

```bash
git clone --depth 1 https://github.com/bojieli/ai-agent-book.git upstream
```

## 构建与检查

```bash
node tools/build.mjs                 # 构建全部章节和总目录到 web/
node tools/build.mjs --only ch03     # 只构建某一章
node tools/check.mjs                 # 脚本语法、页面 id、钩子、分部编号
node tools/coverage.mjs ch03         # 对照原书检查要点覆盖（标题、实验、图、思考题、表头、加粗要点）
python tools/smoke.py ch03           # 无头浏览器逐页逐步播放并点击交互元素，收集脚本错误与布局问题（不截图）
```

`smoke.py` 需要 Python 版 Playwright 与 Chromium。

## 修改或新增页面

先读 [docs/AUTHORING.md](docs/AUTHORING.md)。要点：页面写在 `src/chNN/` 的 HTML 片段里；每页一个 `<section class="slide">`，配套的 `<style>` 和 `HOOKS['页面id']` 脚本；`.src` 出处写原书小节标题原文；改完跑一遍上面四项检查。
