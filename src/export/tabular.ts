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

export function download(filename: string, data: BlobPart, mime: string): void {
  const url = URL.createObjectURL(new Blob([data], { type: mime }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
