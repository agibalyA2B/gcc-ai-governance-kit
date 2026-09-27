// Fails CI if a tracked file looks like it contains an API key or token.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const patterns = [
  /sk-[A-Za-z0-9_-]{20,}/, /sk-ant-[A-Za-z0-9_-]{20,}/, /AKIA[0-9A-Z]{16}/, /AIza[0-9A-Za-z_-]{35}/,
  /gh[pousr]_[A-Za-z0-9]{30,}/, /xox[baprs]-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /(api[_-]?key|secret|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
];
const files = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean)
  .filter((f) => !/\.(png|jpe?g|gif|webp|woff2?|ico|xlsx|pdf)$/i.test(f) && !f.endsWith('package-lock.json'));
const hits = [];
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const p of patterns) if (p.test(text)) hits.push(`${f}: matches ${p}`);
}
if (hits.length) { console.error(hits.join('\n')); process.exit(1); }
console.log(`secrets ok: ${files.length} files scanned`);
