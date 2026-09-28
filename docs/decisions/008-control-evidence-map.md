# ADR 008: Control-evidence map stored with each use case

**Status:** accepted, 2026-09-28

**Context.** A control list tells a team what to do; a committee needs to see what is done. A tester built his own
evidence map (Met / Partly / Gap / N/A plus proof) to take his product to review, which shows the need.

**Decision.**
- Each use case gains an optional `evidence` map keyed by control id: `{ status, note }`, where status is
  `met`, `partly`, `gap`, `na` or empty.
- It lives inside the existing register record (format version 1). A missing map means "not reviewed", so registers
  saved before 0.3.0 load unchanged, and older versions of the kit ignore the field.
- Imports are cleaned: unknown control ids, bad statuses and empty entries are dropped; notes are capped at 4,000
  characters.
- Notes save as the user types. The committee report, XLSX and CSV show the status and the evidence.

**Alternatives.**
- A separate evidence store: rejected, because backup and restore would need two files.
- Register format version 2: not needed, since the change is additive.

**Consequences.** Evidence for a control that stops applying (after a tier change) is kept but not shown.
