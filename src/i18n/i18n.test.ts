import { detectLang, t, applyLang } from './index';

describe('detectLang', () => {
  it('uses a stored Arabic choice', () => {
    expect(detectLang('ar')).toBe('ar');
  });
  it('uses a stored English choice', () => {
    expect(detectLang('en')).toBe('en');
  });
  it('defaults to English with no stored choice', () => {
    expect(detectLang(null)).toBe('en');
    expect(detectLang('fr')).toBe('en');
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
