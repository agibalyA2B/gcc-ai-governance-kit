import * as XLSX from 'xlsx';
import { toCsv, toXlsx } from './tabular';

describe('toCsv', () => {
  it('starts with a UTF-8 BOM and escapes commas and quotes', () => {
    const csv = toCsv([{ a: 'x, "y"', b: 'ضابط' }]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"x, ""y"""');
    expect(csv).toContain('ضابط');
  });
});

describe('toXlsx', () => {
  it('writes an RTL workbook that round-trips Arabic text', () => {
    const buf = toXlsx([{ name: 'Controls', rows: [{ title: 'تعيين مسؤول' }] }], true);
    const wb = XLSX.read(buf, { type: 'array' });
    expect(wb.Workbook?.Views?.[0]?.RTL).toBe(true);
    expect(XLSX.utils.sheet_to_json<{ title: string }>(wb.Sheets.Controls)[0].title).toBe('تعيين مسؤول');
  });
});
