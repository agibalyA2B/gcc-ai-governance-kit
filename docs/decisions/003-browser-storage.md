# ADR 003: localStorage with an in-memory fallback

**Status:** accepted, 2026-09-27 (supersedes the IndexedDB note in the PRD addendum)

**Context.** The register must persist in the browser only. A typical register holds tens of use cases, each a few KB.

**Decision.**
- Store the register as one JSON document in `localStorage`, under a versioned key.
- When storage is blocked (private mode, policy), fall back to memory and show a warning telling users to export.

**Alternatives.** IndexedDB: more capacity and async, but it adds a wrapper and complexity that ~200 use cases
(well under 1 MB) do not need.

**Consequences.**
- There is a hard ceiling of about 5 MB, far above the expected use.
- The key is versioned, so a later move to IndexedDB can migrate transparently.
- Export and import are the backup path.
