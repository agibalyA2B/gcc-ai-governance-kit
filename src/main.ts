import './styles.css';
import { applyLang, initialLang, storeLang, t, type Lang } from './i18n';

let lang: Lang = initialLang();

function render(): void {
  applyLang(lang);
  document.title = t(lang, 'app.title');
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <header class="header">
      <span class="brand">${t(lang, 'app.title')}</span>
      <nav class="nav" aria-label="Primary">
        <a href="https://github.com/agibalyA2B/gcc-ai-governance-kit">${t(lang, 'nav.github')}</a>
        <button type="button" class="lang-toggle" data-testid="lang-toggle"
          aria-label="${t(lang, 'lang.toggle.label')}">${t(lang, 'lang.toggle')}</button>
      </nav>
    </header>
    <main>
      <section class="hero">
        <h1>${t(lang, 'app.tagline')}</h1>
        <p>${t(lang, 'app.intro')}</p>
      </section>
      <p class="notice" role="status">${t(lang, 'status.preview')}</p>
    </main>`;
  app.querySelector<HTMLButtonElement>('.lang-toggle')?.addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar';
    storeLang(lang);
    render();
    app.querySelector<HTMLButtonElement>('.lang-toggle')?.focus();
  });
}

render();
