# Design Agency

Central repository for design outputs and tooling.

## Structure

| Directory         | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `output/`         | Project-wise design outputs (screens, prototypes)    |
| `designs/`        | Shared design tokens and conventions                 |
| `figma-wrapper/`  | Figma plugin for extracting design data              |
| `html-renderer/`  | Translates agnostic design schemas into HTML files   |

## Design Outputs

All project design deliverables live in `output/<project-name>/`. See [`output/README.md`](output/README.md) for the full directory convention.

### Current Projects

- **[storycraft](output/storycraft/)** — Voice coaching app UI (16 screens)

## Quick Start

Open any HTML file in `output/` directly in a browser — no build step required.
