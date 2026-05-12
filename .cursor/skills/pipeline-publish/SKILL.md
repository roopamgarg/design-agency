---
name: pipeline-publish
description: >-
  Publish design pipeline outputs after review passes. Validates pipeline
  deliverables, creates project viewer pages, updates the portfolio index,
  commits, and pushes. Use when an orchestration issue receives
  issue_children_completed wake, when publishing design deliverables,
  or when running the S8 auto-publish stage.
---

# Pipeline Publish

Automate the final publish step of a design pipeline run. This skill is
triggered when the CTO orchestrator receives an `issue_children_completed`
wake on a pipeline parent issue, indicating all pipeline stages (research,
design system, screens, prototypes, review) are done.

## When to Use

- `issue_children_completed` wake on a pipeline orchestration issue
- Board requests to publish/deploy design deliverables to the portfolio
- Manual publish after pipeline work completes

## Publish Procedure

### 1. Determine the project slug

Read the orchestration issue description or title to find the project slug
(kebab-case name, e.g. `agent-messenger`, `storycraft`).

### 2. Run the publish script

```bash
bash scripts/pipeline-publish.sh <project-slug>
```

The script performs five steps:

1. **Validate** — checks `designs/<slug>/screens/`, `designs/<slug>/system/`,
   and `designs/tokens.css` exist and are non-empty.
2. **Viewer** — generates `designs/<slug>/index.html` from the screen
   inventory if missing. Uses the shared viewer infrastructure
   (`shared/project-viewer.css` + `shared/project-viewer.js`).
3. **Portfolio check** — verifies the project is listed in the root
   `index.html` PROJECTS array. Warns if missing (manual addition required
   for the card metadata: description, colors, categories).
4. **Commit** — stages `designs/<slug>/` and `designs/tokens.css`, commits
   with message `feat(pipeline): publish <slug> design deliverables`.
5. **Push** — pushes to `origin/main`.

### 3. Handle the portfolio card (if new project)

If step 3 warns the project is not in the portfolio, add it manually to
the `PROJECTS` array in `index.html`. Follow the existing card pattern:

```javascript
{
  slug: "project-slug",
  name: "Project Name",
  description: "One-line description.",
  totalScreens: N,
  categories: ["Category1", "Category2"],
  colors: ["#hex1", "#hex2", "#hex3"],
  href: "designs/project-slug/index.html",
  screenBase: "designs/project-slug/screens/",
  screens: [
    { group: "Group Name", items: [
      { num: 1, file: "screen-name.html", name: "Screen Name" },
    ]},
  ]
}
```

Commit and push after adding the card.

### 4. Update the orchestration issue

Mark the pipeline orchestration issue `done` with a comment summarizing:
- Number of screens and prototypes published
- Commit hash
- Link to the portfolio

## Failure Handling

If `pipeline-publish.sh` exits non-zero:

- **Validation failure** (missing files): check if pipeline agents committed
  their work (S7 convention). If files exist in agent workspaces but not in
  the shared workspace, copy them manually and retry.
- **Push failure** (conflict/rejection): pull, resolve, and retry.
- **Any failure**: mark the orchestration issue `blocked` with the error
  output and resolve manually.

## Prerequisites

- `scripts/pipeline-publish.sh` must exist and be executable
- `shared/project-viewer.css` and `shared/project-viewer.js` must exist
- Pipeline agents must have used `inheritExecutionWorkspaceFromIssueId` (S1)
  and committed their own work (S7)

## Related Conventions

- **S1** — Shared Workspace: `PIPELINE.md` § Workspace Sharing
- **S7** — Agent Commit Convention: `PIPELINE.md` § Agent Commit Convention
- **S8** — Auto-Publish After Review: `AGENTS.md` § Auto-Publish After Review
