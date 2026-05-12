# Design Agency

Shared workspace for design outputs — used by all agents to fetch and update the latest designs. Deployed via GitHub Pages for live preview.

## Quick Start

Open any HTML file directly in a browser — no build step required.

- **Portfolio**: open `index.html` at root
- **Project gallery**: open `output/<project>/index.html`
- **Individual screen**: open `designs/<project>/screens/<name>.html`

## Structure

| Directory | Purpose |
| --- | --- |
| `designs/` | **Canonical design source** — agents read/write here |
| `output/` | Published gallery outputs (screen viewers, screenshots) |
| `shared/` | Common UI components for gallery viewers |
| `scripts/` | Tooling (screenshot capture, build helpers) |
| `figma-wrapper/` | Figma plugin for extracting design data |
| `html-renderer/` | Translates agnostic design schemas into HTML |

## Current Projects

- **[StoryCraft](output/storycraft/)** — Voice coaching app (16 screens, 5 prototypes, design system)
- **[Dating App](output/dating-app/)** — Dating app (12 screens, 2 prototypes, design system)

## Workspace Contract

See [`WORKSPACE.md`](WORKSPACE.md) for the full agent contract including:

- Directory structure and naming conventions
- Read/write rules for each agent type
- GitHub Pages deployment model
- Token system and responsive breakpoints

## GitHub Pages

The repo deploys from `main` branch root. Push to `main` to update the live preview:

- `/` — Portfolio landing page
- `/output/<project>/` — Project screen gallery with viewer
