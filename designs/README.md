# Design Output Directory

All design outputs are self-contained HTML files with inline CSS and JS. No external dependencies required — open any file directly in a browser.

## Directory Structure

```
designs/
├── tokens.css              # Shared design tokens (colors, typography, spacing)
├── README.md               # This file
├── <product-name>/         # Product-scoped designs
│   ├── screens/            # UI Generation Agent outputs (static screens)
│   │   ├── home.html
│   │   ├── settings.html
│   │   └── ...
│   ├── prototypes/         # Prototype Generation Agent outputs (interactive flows)
│   │   ├── onboarding-flow.html
│   │   ├── checkout-flow.html
│   │   └── ...
│   └── system/             # Design System Agent outputs (component libraries)
│       ├── components.html
│       └── tokens.html
```

## Conventions

### File Naming
- Lowercase kebab-case: `user-profile.html`, `onboarding-flow.html`
- Screens: noun-based (`dashboard.html`, `settings.html`)
- Prototypes: flow-based (`signup-flow.html`, `checkout-flow.html`)
- System: category-based (`components.html`, `tokens.html`)

### HTML Structure
Every design file must:
1. Be fully self-contained (inline `<style>` and `<script>`)
2. Import shared tokens via a `<link>` to `../../tokens.css` or inline them
3. Include a `<meta name="viewport">` tag for responsive preview
4. Use semantic HTML elements
5. Include `data-screen` attribute on the root design container for tooling

### Shared Design Tokens
`tokens.css` defines CSS custom properties for colors, typography, spacing, and breakpoints. All design files should reference these tokens to maintain consistency. Agents update `tokens.css` when the design system evolves.

### Responsive Breakpoints
- Desktop: 1440px
- Tablet: 768px
- Mobile: 390px

All screen designs should include responsive variants or media queries for these breakpoints.
