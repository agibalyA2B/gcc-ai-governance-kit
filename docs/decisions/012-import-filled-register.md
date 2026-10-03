# ADR 012: Import a filled register spreadsheet

**Status:** accepted, 2026-09-28

**Context.** Some teams fill the register template in Excel first. Until now they had to retype every row into the
app, although the template's field names already matched the app's.

**Decision.**
- "Import a filled register (.xlsx or .csv)" reads the first sheet in the browser. Nothing is uploaded.
- Row 1 holds field names, so columns are matched by name, not position. The template's label row, blank rows and
  unknown columns are ignored.
- Answers may be option ids or their visible English or Arabic labels. Anything unrecognised is left blank and counted,
  never guessed.
- A typed tier is ignored: tiers are always recomputed from the answers.
- Rows without a name or owner are skipped and counted. Import then offers replace or merge, like a JSON restore.

**Alternatives.** Matching columns by position: rejected, because reordered or trimmed sheets would import wrongly
without any warning.

**Consequences.** The template gains `product` and `deployment` columns. A unit test imports the kit's own EN and AR
templates, in both formats, and checks their stated tiers.
