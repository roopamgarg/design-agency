---
name: playwright-screenshot
description: >-
  Capture PNG screenshots of HTML files using Playwright at multiple viewports
  (mobile 390px, desktop 1440px) with optional dark-mode variants. Use when you
  need to screenshot HTML designs, generate visual previews, capture UI renders
  for review, or produce before/after comparison images.
---

# Playwright Screenshot Capture

Capture high-fidelity PNG screenshots of local HTML files at mobile and desktop viewports using Playwright's Chromium engine.

## Prerequisites

Playwright must be installed in the workspace:

```bash
npm install playwright
npx playwright install chromium
```

## Quick Start

```bash
node .cursor/skills/playwright-screenshot/scripts/capture-screenshots.js <path-to-html-or-directory>
```

Outputs PNGs to a `screenshots/` folder adjacent to the input files.

## Usage

### Single file

```bash
node .cursor/skills/playwright-screenshot/scripts/capture-screenshots.js output/app/screens/home.html
```

### Directory of HTML files

```bash
node .cursor/skills/playwright-screenshot/scripts/capture-screenshots.js output/app/screens/
```

### With dark-mode variants

```bash
node .cursor/skills/playwright-screenshot/scripts/capture-screenshots.js --dark output/app/screens/
```

### Custom output directory

```bash
node .cursor/skills/playwright-screenshot/scripts/capture-screenshots.js --outdir ./previews output/app/screens/
```

### Custom viewport

```bash
node .cursor/skills/playwright-screenshot/scripts/capture-screenshots.js --viewport 1920x1080 output/app/index.html
```

## Output Structure

```
screenshots/
├── home-mobile.png        # 390×844 viewport, full-page
├── home-desktop.png       # 1440×900 viewport, full-page
├── home-mobile-dark.png   # (with --dark flag)
└── home-desktop-dark.png  # (with --dark flag)
```

Filenames derive from the input HTML filename: `{basename}-{viewport}[-dark].png`.

## Viewports

| Label   | Width | Height |
|---------|-------|--------|
| mobile  | 390   | 844    |
| desktop | 1440  | 900    |

Custom viewports can be passed via `--viewport WxH` (e.g., `--viewport 768x1024` for tablet).

## Options Reference

| Flag | Description |
|------|-------------|
| `--dark` | Also capture dark-mode variants (emulates `prefers-color-scheme: dark`) |
| `--outdir <dir>` | Override the output directory (default: `screenshots/` next to input) |
| `--viewport <WxH>` | Add a custom viewport size (can be repeated) |
| `--full-page` | Capture full scrollable page (default: true) |
| `--no-full-page` | Capture only the visible viewport area |
| `--wait <ms>` | Extra wait time after load (default: 500ms) |
| `--help` | Show help |

## Integration Patterns

### UI Generation Agent

After generating HTML screens, capture screenshots for visual validation:

```bash
node .cursor/skills/playwright-screenshot/scripts/capture-screenshots.js --dark output/project-name/screens/
```

### Design Review Agent

Capture screenshots of rendered designs for comparison and review:

```bash
node .cursor/skills/playwright-screenshot/scripts/capture-screenshots.js output/project-name/screens/
```

Then attach or reference the resulting PNGs for visual diff analysis.

## Troubleshooting

- **Chromium not found**: Run `npx playwright install chromium`
- **Timeout on heavy pages**: Increase wait with `--wait 2000`
- **Blank screenshots**: Ensure the HTML uses absolute or relative paths that resolve from its file location
- **Font rendering issues**: The script waits for `networkidle` + 500ms settle time; increase `--wait` if fonts load slowly
