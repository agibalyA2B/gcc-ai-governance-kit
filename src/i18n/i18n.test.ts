import { detectLang, t, applyLang } from './index';

describe('detectLang', () => {
  it('prefers a stored choice', () => {
    expect(detectLang(['ar-AE'], 'en')).toBe('en');
  });
  it('follows an Arabic browser', () => {
    expect(detectLang(['ar-AE', 'en-US'], null)).toBe('ar');
  });
  it('defaults to English', () => {
    expect(detectLang(['fr-FR'], null)).toBe('en');
  });
});

describe('t', () => {
  it('returns Arabic text for ar', () => {
    expect(t('ar', 'nav.templates')).toBe('النماذج');
  });
  it('falls back to the key when missing', () => {
    expect(t('en', 'does.not.exist')).toBe('does.not.exist');
  });
});

describe('applyLang', () => {
  it('sets rtl for Arabic', () => {
    const el = document.createElement('html');
    applyLang('ar', el);
    expect(el.dir).toBe('rtl');
    expect(el.lang).toBe('ar');
  });
});
