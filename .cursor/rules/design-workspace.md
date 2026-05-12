---
description: Workspace conventions for reading and writing design outputs
globs: ["designs/**", "output/**", "shared/**"]
---

# Design Workspace Conventions

This repository is a shared workspace used by multiple agents. Follow these rules when reading or writing design files.

## Where to write

- **Screen designs** → `designs/<project>/screens/<name>.html`
- **Prototypes** → `designs/<project>/prototypes/<name>.html`
- **Design system** → `designs/<project>/system/`
- **Shared tokens** → `designs/tokens.css`

## Where to read

- Latest designs for a project: `designs/<project>/screens/`
- Design system for a project: `designs/<project>/system/`
- Global tokens: `designs/tokens.css`

## Rules

1. Every HTML file MUST be self-contained (inline styles/scripts) and viewable by opening directly in a browser.
2. Use lowercase kebab-case for filenames: `user-profile.html`, not `UserProfile.html`.
3. Prefix screen files with two-digit order numbers: `01-onboarding.html`.
4. Always include `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
5. Reference shared design tokens from `designs/tokens.css` for cross-project consistency.
6. Support responsive breakpoints: 390px (mobile), 768px (tablet), 1440px (desktop).
7. Add `data-screen="screen-name"` attribute on the root design container.
8. Do NOT write directly to `output/` — that directory is for published/gallery-ready files only.
9. When creating a new project, create the full directory structure: `designs/<project>/{screens,prototypes,system}/`.
10. Read `WORKSPACE.md` at the repo root for the full workspace contract.
