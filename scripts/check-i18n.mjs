// Fails CI when the EN and AR catalogues do not have the same keys, or a value is empty.
import { readFileSync } from 'node:fs';

const load = (l) => JSON.parse(readFileSync(new URL(`../src/i18n/${l}.json`, import.meta.url)));
const en = load('en');
const ar = load('ar');
const problems = [];
for (const k of Object.keys(en)) if (!(k in ar)) problems.push(`missing in ar: ${k}`);
for (const k of Object.keys(ar)) if (!(k in en)) problems.push(`missing in en: ${k}`);
for (const [l, cat] of [['en', en], ['ar', ar]])
  for (const [k, v] of Object.entries(cat)) if (!String(v).trim()) problems.push(`empty in ${l}: ${k}`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`i18n ok: ${Object.keys(en).length} keys in en and ar`);
