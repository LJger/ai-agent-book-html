#!/usr/bin/env node
/*
 * 构建脚本：把 src/ 打包成 web/ 下可以直接双击打开的独立 HTML。
 *
 *   node tools/build.mjs              构建全部已有章节 + 总目录
 *   node tools/build.mjs --only ch03  只构建第三章（可逗号分隔多个），不动总目录
 *
 * 输入
 *   src/engine/   共用引擎：shell.html（页面外壳）、deck.css、core.js、runtime.js、icons.svg
 *   src/chNN/     一章一个目录：chapter.json（分部配色、ready）+ 按文件名顺序拼接的 *.html 页面
 *   src/hub/      总目录：hub.html、hub.css、hub.js
 *   src/chapters.json  全书章节清单（编号、标题、简介、颜色、图标）
 * 输出
 *   web/index.html     总目录
 *   web/chNN.html      各章
 *
 * 章节目录存在就会被构建；chapter.json 里 "ready": true 的章节才会在总目录和上一章 / 下一章导航里显示为可播放。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'web');
const read = (...p) => readFileSync(join(...p), 'utf8');

const onlyArg = process.argv.indexOf('--only');
const only = onlyArg > 0 ? new Set(process.argv[onlyArg + 1].split(',')) : null;

// 用函数做替换，避免内容里的 $& 之类被当成替换模式
const fill = (tpl, map) => tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in map ? map[k] : m));

const engine = {
  shell: read(SRC, 'engine', 'shell.html'),
  css: read(SRC, 'engine', 'deck.css'),
  core: read(SRC, 'engine', 'core.js'),
  runtime: read(SRC, 'engine', 'runtime.js'),
  icons: read(SRC, 'engine', 'icons.svg'),
};

const book = JSON.parse(read(SRC, 'chapters.json'));
const cfgOf = (id) => (existsSync(join(SRC, id, 'chapter.json')) ? JSON.parse(read(SRC, id, 'chapter.json')) : null);
for (const ch of book.chapters) {
  const cfg = cfgOf(ch.id);
  ch.ready = !!(cfg && cfg.ready);
  ch.exists = !!cfg;
}
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const built = [];
for (const ch of book.chapters) {
  if (!ch.exists || (only && !only.has(ch.id))) continue;
  const dir = join(SRC, ch.id);
  const cfg = cfgOf(ch.id);
  const parts = readdirSync(dir).filter((f) => f.endsWith('.html')).sort();
  const slides = parts.map((f) => `<!-- ===== ${f} ===== -->\n` + read(dir, f)).join('\n');

  // 上一章 / 下一章：取清单里相邻的章节
  const i = book.chapters.indexOf(ch);
  const near = (c) => (c ? { id: c.id, no: c.no, title: c.title, href: `${c.id}.html`, ready: c.ready } : null);
  const config = { id: ch.id, no: ch.no, title: ch.title, ...cfg, prev: near(book.chapters[i - 1]), next: near(book.chapters[i + 1]) };

  const html = fill(engine.shell, {
    TITLE: `${ch.no} ${ch.title} · 深入理解 AI Agent 动画版`,
    CSS: engine.css,
    CORE: engine.core,
    CONFIG: JSON.stringify(config),
    ICONS: engine.icons,
    SLIDES: slides,
    RUNTIME: engine.runtime,
    HUB: 'index.html',
  });
  writeFileSync(join(OUT, `${ch.id}.html`), html);
  const count = (slides.match(/<section class="slide/g) || []).length;
  built.push(`${ch.id}.html  ${count} 页  ${(html.length / 1024).toFixed(0)} KB${ch.ready ? '' : '  （未标记 ready）'}`);
}

if (!only) {
  const hubBook = { ...book, chapters: book.chapters.map(({ exists, ...c }) => c) };
  const hub = fill(read(SRC, 'hub', 'hub.html'), {
    CSS: engine.css + '\n' + read(SRC, 'hub', 'hub.css'),
    CORE: engine.core,
    ICONS: engine.icons,
    BOOK: JSON.stringify(hubBook),
    HUB_JS: read(SRC, 'hub', 'hub.js'),
  });
  writeFileSync(join(OUT, 'index.html'), hub);
  built.unshift(`index.html  总目录  ${(hub.length / 1024).toFixed(0)} KB`);
}

console.log(built.map((s) => '  ' + s).join('\n') || '  （没有可构建的章节）');
