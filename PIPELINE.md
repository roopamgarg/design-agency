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

## Agent Commit Convention (S7)

Every pipeline agent MUST commit its own work before marking its issue `done`. This ensures the shared workspace accumulates all changes on disk and in git.

### Rules

1. After writing all output files, run `git add` for only the paths you own (see Canonical Output Paths above).
2. Commit with a descriptive message: `feat(pipeline): {agent-role} — {project-slug}` (e.g. `feat(pipeline): ui-screens — agent-messenger`).
3. Include `Co-Authored-By: Paperclip <noreply@paperclip.ing>` at the end of every commit message.
4. Do NOT push. The publish step handles the push.
5. If the commit fails due to conflicts, mark your issue `blocked` with the conflict details and tag the CTO.

### Example

```bash
git add designs/agent-messenger/screens/ designs/agent-messenger/screenshots/
git commit -m "feat(pipeline): ui-screens — agent-messenger

Generated 9 MVP screen designs with screenshots.

Co-Authored-By: Paperclip <noreply@paperclip.ing>"
```

## Publish Stage (S8)

After the design review agent marks its review issue `done`, the CTO orchestrator automatically runs the publish step. This is triggered by the `issue_children_completed` wake on the parent orchestration issue.

### Publish Steps

1. Verify the shared workspace has all expected files (`designs/{slug}/screens/`, `prototypes/`, `system/`).
2. Run `scripts/pipeline-publish.sh {project-slug}` which:
   - Validates all pipeline agent commits are present.
   - Creates the project viewer page (`designs/{slug}/index.html`) if missing.
   - Adds the project to the portfolio (`index.html`) if not already listed.
   - Commits the portfolio update.
   - Pushes the entire branch to `origin/main`.
3. Mark the orchestration issue `done` with a summary of what was published.

### Failure Handling

If publish fails (merge conflict, missing files, push rejection), the CTO marks the orchestration issue `blocked` with the failure details and resolves manually.

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
