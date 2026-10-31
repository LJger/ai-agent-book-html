#!/usr/bin/env node
/*
 * 静态检查（不打开浏览器）：
 *   node tools/check.mjs              检查 web/ 下全部产物
 *   node tools/check.mjs --only ch03  只检查第三章（可逗号分隔多个）
 * 对 web/ 下每个构建产物：
 *   1. 抽出所有 <script> 做语法编译检查
 *   2. 页面 id 不重复；每个 HOOKS['id'] 都有对应的页面
 *   3. data-part 在本章配置的分部范围内；每页都有 data-title
 *   4. 每页 <style> 里以 # 开头的选择器只指向本页 id 或已存在的元素 id（防止样式写错页）
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WEB = join(ROOT, 'web');
let problems = 0;
const bad = (file, msg) => { problems++; console.log(`  ✗ ${file}: ${msg}`); };

const onlyArg = process.argv.indexOf('--only');
const only = onlyArg > 0 ? new Set(process.argv[onlyArg + 1].split(',').map((x) => x + '.html')) : null;

for (const f of readdirSync(WEB).filter((x) => x.endsWith('.html') && (!only || only.has(x))).sort()) {
  const html = readFileSync(join(WEB, f), 'utf8');

  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  scripts.forEach((code, i) => {
    try { new vm.Script(code, { filename: `${f}#script${i}` }); }
    catch (e) { bad(f, `script #${i} 语法错误：${e.message}`); }
  });

  const ids = [...html.matchAll(/<section class="slide[^"]*" id="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  ids.forEach((id) => { if (seen.has(id)) bad(f, `页面 id 重复：${id}`); seen.add(id); });

  const hooks = [...html.matchAll(/^HOOKS\['([^']+)'\]\s*=/gm)].map((m) => m[1]);
  hooks.forEach((h) => { if (!seen.has(h)) bad(f, `HOOKS['${h}'] 没有对应的页面`); });

  const cfg = html.match(/window\.DECK_CFG = (\{[\s\S]*?\});\n<\/script>/);
  if (cfg) {
    const nParts = JSON.parse(cfg[1]).parts.length;
    for (const m of html.matchAll(/<section class="slide[^"]*" id="([^"]+)"([^>]*)>/g)) {
      const attrs = m[2];
      const part = attrs.match(/data-part="(\d+)"/);
      if (!part) bad(f, `${m[1]} 缺少 data-part`);
      else if (+part[1] >= nParts) bad(f, `${m[1]} 的 data-part=${part[1]} 超出分部数 ${nParts}`);
      if (!/data-title="[^"]+"/.test(attrs)) bad(f, `${m[1]} 缺少 data-title`);
    }
  }

  // 只检查页面区域（#deck 之内）各页自带的 <style>；页头的共享样式包含 HUD 等可选元素
  const deckHtml = html.slice(html.indexOf('<div id="deck">'));
  const allIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of deckHtml.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
    for (const sel of m[1].matchAll(/#([a-zA-Z][\w-]*)/g)) {
      const id = sel[1];
      // 颜色值（#fff、#22d3ee）不是选择器
      if (/^[0-9a-fA-F]{3,8}$/.test(id)) continue;
      if (!allIds.has(id)) bad(f, `<style> 引用了不存在的 #${id}`);
    }
  }

  console.log(`${problems ? '…' : '✓'} ${f}：${ids.length} 页，${scripts.length} 段脚本，${hooks.length} 个页面钩子`);
}
if (problems) { console.log(`共 ${problems} 处问题`); process.exit(1); }
console.log('静态检查通过');
