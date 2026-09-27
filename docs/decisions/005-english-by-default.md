# ADR 005: English by default, Arabic by choice

**Status:** accepted, 2026-09-27 (changes FR-14; replaces "language follows the browser")

**Context.** v0.1.0 opened in Arabic whenever the browser listed an Arabic locale. Many GCC professionals run
Arabic-locale browsers but share links in English-language settings (committees, hiring panels, consultants). Feedback
on v0.2.0: landing in Arabic from an English link was confusing, and the page gave no hint of why.

**Decision.**
- The first visit is always in English.
- The عربي toggle in the header switches to Arabic with a right-to-left layout.
- The choice is stored in the browser and reused on every later visit.

**Alternatives.**
- Keep following the browser: good for Arabic-first users, but unpredictable for a shared link.
- A `?lang=ar` URL parameter: useful later for sharing an Arabic link, but not needed to fix the surprise.

**Consequences.**
- Arabic-first users click once, and are then remembered.
- The Arabic toggle label is written in Arabic, so it stays easy to find.
- The e2e test for an Arabic browser now checks that the page opens in English.
