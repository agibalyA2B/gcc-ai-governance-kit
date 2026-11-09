// Validates /data files against their JSON Schemas. Runs in CI.
import { readFileSync, existsSync } from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url)));
const checks = [['data/questions.json', 'data/schema/questions.schema.json'], ['data/crosswalk.json', 'data/schema/crosswalk.schema.json']];
let failed = false;
for (const [file, schema] of checks) {
  if (!existsSync(new URL(`../${file}`, import.meta.url))) { console.log(`skip ${file} (not present yet)`); continue; }
  const validate = ajv.compile(read(schema));
  if (!validate(read(file))) { failed = true; console.error(`${file}:`, JSON.stringify(validate.errors, null, 2)); }
  else console.log(`${file} ok`);
}
const cw = existsSync(new URL('../data/crosswalk.json', import.meta.url)) ? read('data/crosswalk.json') : [];
const ids = cw.map((c) => c.id);
if (new Set(ids).size !== ids.length) { failed = true; console.error('duplicate control ids'); }
// Dependencies (ADR 018): each names another real control, and they never form a cycle.
const deps = new Map(cw.map((c) => [c.id, c.depends_on ?? []]));
for (const [id, ds] of deps) for (const d of ds) if (d === id || !deps.has(d)) { failed = true; console.error(`${id}: bad depends_on ${d}`); }
const state = new Map();
const visit = (id, path) => {
  if (state.get(id) === 'done') return;
  if (state.get(id) === 'open') { failed = true; console.error(`depends_on cycle: ${[...path, id].join(' -> ')}`); return; }
  state.set(id, 'open');
  for (const d of deps.get(id) ?? []) if (deps.has(d)) visit(d, [...path, id]);
  state.set(id, 'done');
};
for (const id of deps.keys()) visit(id, []);
if (cw.length) console.log(`crosswalk: ${cw.length} controls, ${cw.filter((c) => c.verified).length} verified, ${[...deps.values()].flat().length} dependencies`);
process.exit(failed ? 1 : 0);
