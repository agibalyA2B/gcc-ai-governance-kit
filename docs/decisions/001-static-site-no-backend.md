# ADR 001: Static site, no backend

**Status:** accepted, 2026-09-27

**Context.** The primary user is a government AI office lead. Such users often cannot paste internal use-case details
into third-party services, and the kit must be free to run and easy to fork.

**Decision.** Build the app as a static Vite + TypeScript site on GitHub Pages. There is no backend, no login and no API
keys. Use-case data lives only in the browser (IndexedDB, with a localStorage fallback). The UI uses plain TypeScript
modules rather than a framework, which keeps the bundle small and the code readable for non-specialists.

**Alternatives.**
- A hosted app with accounts: gives collaboration, but raises data-residency and trust barriers and has running costs.
- React or Preact: faster to build complex UI, but adds weight that 5 screens do not need.

**Consequences.**
- There is no multi-user collaboration; teams share through JSON/XLSX export and import.
- Privacy is a feature: no network request carries user data, and this is enforced by review and an e2e check.
- Everything works offline once the page has loaded.
