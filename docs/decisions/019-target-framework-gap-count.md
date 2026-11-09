# ADR 019: Target-framework gap count, with NIST grouped by function

**Status:** accepted, 2026-11-09

**Context.** Teams are often asked "how far are we from framework X?", for example the UAE CSC AI Security Policy or
ISO/IEC 42001. Teams that already work in NIST AI RMF terms want to read the kit by Govern, Map, Measure and Manage.

**Decision.**
- The Controls step gets one "target framework" picker. It is kept for the whole register, not per use case, because
  an organisation usually works towards one framework at a time.
- For the open use case it shows: of the applicable kit controls mapped to that framework, how many are at Gap or
  Partly met and how many are not reviewed yet. It counts against the target alone, whatever frameworks are selected.
- With NIST AI RMF as the target, a table groups the same counts by function. A control that cites two functions
  counts once in each, and the page says so.
- The count appears in the committee PDF and as an extra XLSX sheet when a target is picked.
- Every view states that this counts kit controls mapped to the framework and is not a conformity assessment.

**Alternatives.** A separate NIST page: rejected, as it would duplicate the controls list. A percentage "compliance
score": rejected, because it would read as conformity the kit cannot establish.

**Consequences.** No change to the tier, the autonomy level or which controls apply.
