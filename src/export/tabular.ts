import * as XLSX from 'xlsx';

export type Row = Record<string, string | number>;

export function toCsv(rows: Row[]): string {
  if (!rows.length) return '﻿';
  const headers = Object.keys(rows[0]);
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [headers.map(esc).join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\r\n');
}

export function toXlsx(sheets: { name: string; rows: Row[] }[], rtl: boolean): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(s.rows), s.name.slice(0, 31));
  wb.Workbook = { Views: [{ RTL: rtl }] };
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}

/** Reads the first sheet of an XLSX or CSV file into rows of strings. CSV is decoded as UTF-8 (a BOM is ignored). */
export function readTable(data: ArrayBuffer): string[][] {
  const bytes = new Uint8Array(data);
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // "PK": an XLSX package
  const wb = isZip
    ? XLSX.read(bytes, { type: 'array' })
    : XLSX.read(new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, ''), { type: 'string', raw: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' });
}

export function download(filename: string, data: BlobPart, mime: string): void {
  const url = URL.createObjectURL(new Blob([data], { type: mime }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
