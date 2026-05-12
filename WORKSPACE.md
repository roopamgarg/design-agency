# Design Workspace

This repository is the **shared workspace** for all design agents. Every agent that produces or consumes design outputs uses this repo as the single source of truth.

## Quick Reference

| What you want to do | Where to do it |
| --- | --- |
| Write a new screen design | `designs/<project>/screens/<name>.html` |
| Write a prototype | `designs/<project>/prototypes/<name>.html` |
| Update design system components | `designs/<project>/system/` |
| Read/update shared tokens | `designs/tokens.css` |
| Publish final gallery output | `output/<project>/` |
| Add screenshots for preview | `output/<project>/screenshots/` |

## Directory Structure

```
.
├── WORKSPACE.md              # This file — workspace contract
├── README.md                 # Public repo README
├── index.html                # Root portfolio page (GitHub Pages entry)
├── designs/                  # CANONICAL design source (agents read/write here)
│   ├── tokens.css            # Shared design tokens (colors, type, spacing)
│   ├── README.md             # Design conventions
│   └── <project>/            # Per-project working directory
│       ├── screens/          # Static UI screen HTML files
│       ├── prototypes/       # Interactive flow HTML files
│       └── system/           # Project design system (components, tokens)
├── output/                   # PUBLISHED design outputs (gallery-ready)
│   ├── README.md             # Output conventions
│   └── <project>/
│       ├── index.html        # Project gallery page (auto-links all screens)
│       ├── screens/          # Final screen files
│       ├── prototypes/       # Final prototype files
│       ├── system/           # Project-specific system assets
│       └── screenshots/      # Captured PNGs (mobile + desktop)
├── shared/                   # Common UI components for viewers/galleries
│   ├── project-viewer.css    # Shared viewer styles
│   └── project-viewer.js     # Shared viewer behavior
├── scripts/                  # Tooling scripts
│   └── capture-screenshots.js
├── figma-wrapper/            # Figma extraction plugin
└── html-renderer/            # Schema-to-HTML renderer
```

## Agent Workflow

### Writing designs (UI Gen, Prototype Gen, Design System agents)

1. Write HTML files to `designs/<project>/<category>/`.
2. Use shared tokens from `designs/tokens.css`.
3. Follow naming conventions in `designs/README.md`.
4. Every HTML file must be self-contained and viewable by opening directly in a browser.

### Publishing outputs (Build/Preview pipeline)

1. Copy finalized screens from `designs/<project>/` into `output/<project>/`.
2. Generate or update the project `index.html` gallery.
3. Capture screenshots using `scripts/capture-screenshots.js`.
4. Commit and push — GitHub Pages serves from root.

### Reading designs (any consuming agent)

1. Check `designs/<project>/screens/` for the latest screen files.
2. Check `designs/<project>/system/` for design system assets.
3. Reference `designs/tokens.css` for the global token set.

## File Conventions

| Rule | Detail |
| --- | --- |
| Naming | Lowercase kebab-case: `user-profile.html` |
| Screen prefix | Two-digit order: `01-onboarding.html`, `02-home.html` |
| Self-contained | Inline `<style>` and `<script>`, or reference project-local CSS only |
| Viewport meta | Always include `<meta name="viewport">` |
| Responsive | Support 390px (mobile), 768px (tablet), 1440px (desktop) |
| Data attribute | Root design container has `data-screen="screen-name"` |

## GitHub Pages Deployment

The repo is structured for direct GitHub Pages deployment from the `main` branch root:

- `index.html` at root is the portfolio landing page.
- `output/<project>/index.html` pages are linked from the portfolio.
- All assets are relative-path referenced — no build step needed.
- Push to `main` to publish updates.

## Adding a New Project

1. Create `designs/<project-name>/` with `screens/`, `prototypes/`, `system/` subdirs.
2. Create `output/<project-name>/` with an `index.html` gallery.
3. Register the project in the root `index.html` portfolio page.
4. Add an entry to the root `README.md` project list.

## Token System

`designs/tokens.css` defines CSS custom properties shared across all projects:

- **Colors**: brand palette, semantic colors, neutrals
- **Typography**: font families, sizes, weights, line heights
- **Spacing**: consistent spacing scale
- **Breakpoints**: mobile/tablet/desktop widths
- **Shadows & Radii**: elevation and rounding tokens

Agents should reference these tokens rather than hardcoding values whenever cross-project consistency matters.
