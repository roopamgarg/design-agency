# HTML Renderer Integration Layer

## Architectural Decoupling

The core UI and Prototype Generation pipeline agents remain independent of the rendering target via the **Agnostic JSON Schema**.

1. **Pipeline Agents** produce `AgnosticComponent` / `AgnosticScreen` / `AgnosticPrototype` JSON schemas describing layout, properties, and intention abstractly.
2. **HTML Translator** (`html-translator.ts`) consumes these schemas and produces self-contained HTML files with inline CSS/JS. Files are written to the `designs/` directory.
3. **Design Review Agent** opens HTML files directly in a browser for review (responsiveness, accessibility, visual fidelity).

## Translator Component

The `HtmlTranslator` class maps agnostic components to semantic HTML elements:

| Agnostic Type | HTML Element |
|---------------|-------------|
| `container`   | `<div>`     |
| `button`      | `<button>`  |
| `text`        | `<p>`       |
| `image`       | `<img>`     |
| `input`       | `<input>`   |
| `link`        | `<a>`       |
| `list`        | `<ul>`      |
| `nav`         | `<nav>`     |

Styles from `AgnosticStyle` are translated to inline CSS. Prototype transitions become vanilla JS event handlers.

## Migration from Figma

This module replaces `figma-wrapper/integration/translator.ts`. The agnostic schema is shared (with extensions for HTML-specific attributes like `href`, `alt`, `ariaLabel`). The `figma-wrapper/` directory is retained for reference but is no longer in the active pipeline.
