export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const tierIcon: Record<string, string> = { little: '●', limited: '◆', high: '▲', unacceptable: '■' };
