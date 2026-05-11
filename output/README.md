# Design Outputs

All project design outputs live here, organized by project name.

## Directory Structure

```
output/
├── README.md
├── <project-name>/
│   ├── index.html              # Project screen gallery / entry point
│   ├── screens/                # Static UI screen designs
│   │   ├── 01-onboarding.html
│   │   ├── 02-home.html
│   │   └── ...
│   ├── prototypes/             # Interactive flow prototypes
│   │   ├── onboarding-flow.html
│   │   └── ...
│   └── system/                 # Project-specific design system assets
│       ├── tokens.css
│       └── components.css
```

## Conventions

### Adding a New Project

1. Create a folder under `output/` using lowercase kebab-case (e.g., `output/my-app/`).
2. Add an `index.html` gallery page that links to all screens.
3. Place static screen designs in `screens/`.
4. Place interactive prototypes in `prototypes/`.
5. Place project-specific tokens and component CSS in `system/`.

### File Naming

- Lowercase kebab-case: `user-profile.html`, `onboarding-flow.html`
- Prefix screens with a two-digit order number: `01-onboarding.html`, `02-home.html`
- Screens: noun-based (`dashboard.html`, `settings.html`)
- Prototypes: flow-based (`signup-flow.html`, `checkout-flow.html`)

### HTML Requirements

Every design file must:

1. Be fully self-contained (inline `<style>` and `<script>`) or reference project-local CSS only
2. Include `<meta name="viewport">` for responsive preview
3. Use semantic HTML elements
4. Be viewable by opening the file directly in a browser — no build step required
