#!/usr/bin/env node
/*
 * 内容覆盖率检查：对照原书 Markdown，确认动画没有漏掉要点。
 *
 *   node tools/coverage.mjs ch03          检查第三章
 *   node tools/coverage.mjs ch03 --list   同时列出全部加粗要点的覆盖情况
 *
 * 从原书抽取：
 *   必须覆盖（缺一项即失败）：各级标题、实验编号（实验 3-2）、图号（图3-5）、思考题
 *   建议覆盖（列出缺失项，供逐条确认）：表格表头、加粗要点（**…**）
 * 在 src/chNN/*.html 的全部源码里查找（页面文字、data-notes 讲解、.src 出处、脚本里的数据都算），
 * 比对前去掉空白、标点和 HTML 标签。
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
const listAll = process.argv.includes('--list');
if (!/^ch\d\d$/.test(id || '')) {
  console.log('用法：node tools/coverage.mjs chNN [--list]');
  process.exit(2);
}
const n = +id.slice(2);
const mdFile = n === 0 ? 'introduction.md' : n === 11 ? 'afterword.md' : `chapter${n}.md`;
const md = readFileSync(join(ROOT, 'upstream', 'book', mdFile), 'utf8');
const dir = join(ROOT, 'src', id);
if (!existsSync(dir)) { console.log(`src/${id} 不存在`); process.exit(2); }
const src = readdirSync(dir).filter((f) => f.endsWith('.html')).sort().map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');

const ent = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const PUNCT = /[\s「」“”"'‘’《》〈〉（）()【】\[\]{}·•：:，,。.、；;！!？?—–\-_*`~^|/\\=+<>#$&%@…→←↔↑↓]/g;
const norm = (s) => s.replace(/&[a-z#0-9]+;/gi, (m) => ent[m] || ' ').toLowerCase().replace(PUNCT, '');
// 两种形态都查：原始源码，以及去掉行内标签后的源码（避免 <b>…</b> 把一句话截断）
const hayA = norm(src);
const hayB = norm(src.replace(/<\/?[a-zA-Z][^<>]*>/g, ''));
const has = (s) => { const k = norm(s); return k.length > 0 && (hayA.includes(k) || hayB.includes(k)); };

// 去掉代码块和脚注定义，避免把代码里的 # 注释当成标题
const body = md.replace(/```[\s\S]*?```/g, '').replace(/^\[\^[^\]]+\]:.*$/gm, '');
const clean = (s) => s.replace(/\{[^}]*\}/g, '').replace(/\*\*|__|`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\$[^$]*\$/g, '').trim();

const headings = [...body.matchAll(/^(#{1,4})\s+(.+)$/gm)].map((m) => ({ lv: m[1].length, t: clean(m[2]) }));
const exps = [...new Map([...body.matchAll(/实验\s*(\d+-\d+[A-Z]?)/g)].map((m) => [m[1], m[1]])).keys()];
const figs = [...new Map([...body.matchAll(/!\[(图\s*\d+-\d+)/g)].map((m) => [m[1].replace(/\s/g, ''), 1])).keys()];
const qSec = body.split(/^##\s+思考题.*$/m)[1] || '';
const questions = [...qSec.matchAll(/^\d+\.\s+(.+)$/gm)].map((m) => clean(m[1]).replace(/^[★☆\s]+/, ''));
const tables = [];
for (const m of body.matchAll(/^\|(.+)\|\s*\n\|[\s:|-]+\|\s*$/gm)) tables.push(m[1].split('|').map((c) => clean(c)).filter(Boolean));
const bolds = [...new Set([...body.matchAll(/\*\*([^*\n]{2,80}?)\*\*/g)].map((m) => clean(m[1])).filter((b) => b && !/^实验\s*\d/.test(b) && !b.includes('$')))];

// 图号 / 实验号要精确匹配编号，避免“图2-1”误中“图2-10”
const hasNum = (prefix, num) => new RegExp(`${prefix}\\s*${num.replace(/^\D+/, '').replace(/-/g, '\\s*-\\s*')}(?![\\d])`).test(src);

const miss = { h: [], e: [], f: [], q: [], t: [], b: [] };
headings.forEach((h) => { if (!has(h.t)) miss.h.push(`${'#'.repeat(h.lv)} ${h.t}`); });
exps.forEach((e) => { if (!hasNum('实验', e)) miss.e.push(`实验 ${e}`); });
figs.forEach((f) => { if (!hasNum('图', f)) miss.f.push(f); });
// 思考题：取题干前 16 个有效字符比对
questions.forEach((q) => { const head = [...norm(q)].slice(0, 16).join(''); if (!(hayA.includes(head) || hayB.includes(head))) miss.q.push(q.slice(0, 50)); });
tables.forEach((cells) => { const lost = cells.filter((c) => !has(c)); if (lost.length) miss.t.push(`表头 [${cells.join(' | ')}] 缺：${lost.join('、')}`); });
const boldHit = bolds.filter(has);
bolds.forEach((b) => { if (!has(b)) miss.b.push(b); });

const line = (label, total, lost) => console.log(`${lost.length ? '✗' : '✓'} ${label}：${total - lost.length}/${total}`);
console.log(`覆盖率检查 ${id}（原书 ${mdFile}）`);
line('标题', headings.length, miss.h);
line('实验', exps.length, miss.e);
line('图', figs.length, miss.f);
line('思考题', questions.length, miss.q);
line('表格表头', tables.length, miss.t);
console.log(`${miss.b.length / Math.max(1, bolds.length) <= 0.15 ? '✓' : '△'} 加粗要点：${boldHit.length}/${bolds.length}（${Math.round((boldHit.length / Math.max(1, bolds.length)) * 100)}%，建议 ≥ 85%）`);
const dump = (title, arr) => { if (arr.length) console.log(`\n${title}\n` + arr.map((x) => '  - ' + x).join('\n')); };
dump('缺少的标题：', miss.h);
dump('缺少的实验：', miss.e);
dump('缺少的图：', miss.f);
dump('缺少的思考题：', miss.q);
dump('表格表头缺项（建议覆盖）：', miss.t);
dump('未出现的加粗要点（逐条确认：补上，或确认只是修辞强调）：', miss.b);
if (listAll) dump('已覆盖的加粗要点：', boldHit);

const fatal = miss.h.length + miss.e.length + miss.f.length + miss.q.length;
process.exit(fatal ? 1 : 0);
