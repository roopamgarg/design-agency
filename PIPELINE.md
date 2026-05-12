# Pipeline Convention

Standard directory structure and coordination rules for all design pipeline runs.

## Canonical Output Paths

All pipeline agents MUST write outputs to the following paths relative to the workspace root:

```
designs/{project-slug}/
  research/          ← Research Intelligence Agent, Product Understanding Agent
  design-system/     ← Design System Agent (also updates designs/tokens.css)
  screens/           ← UI Generation Agent
  prototypes/        ← Prototype Generation Agent
  screenshots/       ← Screenshot pipeline (capture-screenshots.js)
  reviews/           ← Design Review Agent reports
  index.html         ← Project viewer
```

### Path Rules

1. **Always derive paths from the project slug.** The slug is the kebab-case project name used as the directory under `designs/`.
2. **Never invent ad-hoc directories.** If your output doesn't fit the structure above, ask the CTO to extend this convention first.
3. **Shared tokens live at `designs/tokens.css`** — not inside the project directory. Per-project overrides go in `designs/{project-slug}/design-system/`.
4. **Published outputs go to `output/{project-slug}/`** only after review passes. Do not write directly to `output/` during pipeline execution.

## Workspace Sharing (S1)

All child issues in a pipeline run MUST use `inheritExecutionWorkspaceFromIssueId` pointing to the parent orchestration issue. This ensures every agent in the pipeline reads and writes to the same workspace checkout. Never create pipeline child issues without this field.

## File Naming

| Category     | Convention                          | Examples                              |
| ------------ | ----------------------------------- | ------------------------------------- |
| Screens      | `NN-kebab-name.html` (zero-padded)  | `01-onboarding.html`, `05-home.html`  |
| Prototypes   | `kebab-flow-name.html`              | `onboarding-flow.html`               |
| Design system| `components.html`, `tokens.html`    |                                       |
| Research     | `research-brief.md`, `competitors.md`|                                      |
| Reviews      | `review-vN.json`                    | `review-v1.json`                      |
| Screenshots  | `{screen-name}-{viewport}.png`      | `05-home-mobile.png`                  |

## Run Batching Discipline (S6)

If you encounter a minor issue during execution (file path typo, naming inconsistency, missing token reference, trivial formatting), fix it in the same heartbeat. Do not exit and re-enter for trivial fixes — each heartbeat has budget cost. Reserve separate heartbeats for substantive new work only.

## Pre-Pipeline Readiness Checklist (S5)

Before the CTO starts any new project pipeline, verify:

- [ ] Project slug decided and `designs/{slug}/` directory structure created
- [ ] `designs/tokens.css` exists with base token set
- [ ] Screenshot skill installed and `scripts/capture-screenshots.js` available
- [ ] Output directory `output/{slug}/` created with viewer template
- [ ] All pipeline agents are idle (no in-progress tasks that would conflict)
- [ ] `PIPELINE.md` (this file) is present and up-to-date
