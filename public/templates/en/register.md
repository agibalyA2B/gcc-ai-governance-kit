# AI Use-Case Register

List every AI use case here — one row per use case — using the same field names as the app (row 1) so a completed register can be re-imported later; row 2 gives the human-readable label for each column. The two example rows show a low-risk chatbot and a high-risk agent scored with the option ids from data/questions.json.

Licensed under CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/

| ID | Use case | Owner | Business unit | What does the AI do? | Status | Does the solution use AI when it runs? | AI type | What does the AI's output influence? | What data does it use? | Who could be affected? | How much does it act on its own? | How is its work reviewed by people? | What can it change in other systems? | If it gets something wrong, can the result be undone? | Risk tier | Deep-dive | Updated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| uc-example-chatbot | Website FAQ chatbot | Digital Channels | Customer Experience | Answers general questions and hands over to a person when needed. | production | yes | generative | public-info | none | public | monitored | exceptions | none | easy | limited | false | 2026-01-15 |
| uc-example-triage | Citizen service triage agent | Customer Service Dept. | Operations | Routes incoming requests automatically; staff review refusals. | pilot | yes | agentic | recommend-individuals | personal | public | monitored | exceptions | record | easy | high | false | 2026-01-15 |
