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
if (cw.length) console.log(`crosswalk: ${cw.length} controls, ${cw.filter((c) => c.verified).length} verified`);
process.exit(failed ? 1 : 0);
