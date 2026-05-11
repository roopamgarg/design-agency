# Figma Integration Layer Pattern

## Architectural Decoupling
To ensure that the core UI and Prototype Generation pipeline agents remain independent of the rendering target, we use an **Agnostic JSON Schema**. 

1. **Pipeline Agents** produce `AgnosticComponent` JSON schemas. This describes layout, properties, and intention abstractly without knowing if it renders in Figma, HTML, or Penpot.
2. **Figma Integration Agent** acts as a bridge. It consumes the `AgnosticComponent` schemas and translates them into `FigmaNodePayload` definitions matching Figma's internal data model.
3. **Figma Plugin Wrapper** is a dumb renderer. It runs inside Figma, ingests the `FigmaNodePayload` JSON via its UI thread (`ui.html`), and sends a message to the Figma execution context (`code.ts`) to programmatically instantiate frames, auto-layouts, texts, and other native nodes.

## Translator Component
The `FigmaTranslator` class (`integration/translator.ts`) demonstrates how the Integration Agent maps properties (e.g. converting a `'button'` with `style.layout = 'row'` into a Figma `FRAME` with `layoutMode = 'HORIZONTAL'`). This decoupling ensures we can easily add a `PenpotTranslator` later without touching the core UI generation models.
