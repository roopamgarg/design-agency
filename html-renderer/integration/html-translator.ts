import {
  AgnosticComponent,
  AgnosticStyle,
  AgnosticScreen,
  AgnosticPrototype,
  PrototypeTransition,
} from '../schemas/agnostic-schema';

/**
 * Translates agnostic UI schemas into self-contained HTML files.
 * Replaces the former FigmaTranslator for the direct-HTML pipeline.
 */
export class HtmlTranslator {
  private tokensPath: string;

  constructor(tokensPath = '../../tokens.css') {
    this.tokensPath = tokensPath;
  }

  renderScreen(screen: AgnosticScreen): string {
    const bodyContent = screen.components.map(c => this.renderComponent(c)).join('\n    ');

    return this.wrapDocument(screen.title, bodyContent, screen.meta);
  }

  renderPrototype(proto: AgnosticPrototype): string {
    const screenDivs = proto.screens
      .map((s, i) => {
        const inner = s.components.map(c => this.renderComponent(c)).join('\n        ');
        const display = i === 0 ? 'block' : 'none';
        return `    <section data-screen="${s.id}" id="screen-${s.id}" style="display:${display};">\n        ${inner}\n    </section>`;
      })
      .join('\n\n');

    const transitionScript = this.buildTransitionScript(proto.transitions);

    const body = `${screenDivs}\n\n    <script>\n${transitionScript}\n    </script>`;

    return this.wrapDocument(proto.title, body);
  }

  renderComponent(comp: AgnosticComponent, indent = 4): string {
    const pad = ' '.repeat(indent);
    const tag = this.tagFor(comp);
    const attrs = this.attrsFor(comp);
    const style = this.styleString(comp.style);
    const styleAttr = style ? ` style="${style}"` : '';

    const selfClosing = tag === 'img' || tag === 'input';
    if (selfClosing) {
      return `${pad}<${tag}${attrs}${styleAttr} />`;
    }

    const textContent = comp.text ? this.escapeHtml(comp.text) : '';

    if (!comp.children?.length) {
      return `${pad}<${tag}${attrs}${styleAttr}>${textContent}</${tag}>`;
    }

    const childrenHtml = comp.children.map(c => this.renderComponent(c, indent + 2)).join('\n');
    const inner = textContent ? `\n${pad}  ${textContent}\n${childrenHtml}\n${pad}` : `\n${childrenHtml}\n${pad}`;
    return `${pad}<${tag}${attrs}${styleAttr}>${inner}</${tag}>`;
  }

  private tagFor(comp: AgnosticComponent): string {
    switch (comp.type) {
      case 'button': return 'button';
      case 'text': return 'p';
      case 'image': return 'img';
      case 'input': return 'input';
      case 'link': return 'a';
      case 'list': return 'ul';
      case 'nav': return 'nav';
      case 'container':
      default: return 'div';
    }
  }

  private attrsFor(comp: AgnosticComponent): string {
    const parts: string[] = [];

    if (comp.id) parts.push(`id="${comp.id}"`);
    if (comp.name) parts.push(`data-name="${this.escapeAttr(comp.name)}"`);
    if (comp.role) parts.push(`role="${comp.role}"`);
    if (comp.ariaLabel) parts.push(`aria-label="${this.escapeAttr(comp.ariaLabel)}"`);
    if (comp.href) parts.push(`href="${this.escapeAttr(comp.href)}"`);
    if (comp.src) parts.push(`src="${this.escapeAttr(comp.src)}"` + (comp.alt !== undefined ? ` alt="${this.escapeAttr(comp.alt)}"` : ' alt=""'));
    if (comp.placeholder) parts.push(`placeholder="${this.escapeAttr(comp.placeholder)}"`);

    if (comp.events) {
      for (const [event, handler] of Object.entries(comp.events)) {
        parts.push(`on${event}="${this.escapeAttr(handler)}"`);
      }
    }

    return parts.length ? ' ' + parts.join(' ') : '';
  }

  private styleString(style?: AgnosticStyle): string {
    if (!style) return '';
    const props: string[] = [];

    if (style.backgroundColor) props.push(`background-color: ${style.backgroundColor}`);
    if (style.color) props.push(`color: ${style.color}`);
    if (style.fontSize) props.push(`font-size: ${style.fontSize}px`);
    if (style.fontWeight) props.push(`font-weight: ${style.fontWeight}`);
    if (style.textAlign) props.push(`text-align: ${style.textAlign}`);
    if (style.opacity !== undefined) props.push(`opacity: ${style.opacity}`);
    if (style.cursor) props.push(`cursor: ${style.cursor}`);
    if (style.position) props.push(`position: ${style.position}`);
    if (style.overflow) props.push(`overflow: ${style.overflow}`);

    if (style.layout) {
      props.push('display: flex');
      props.push(`flex-direction: ${style.layout}`);
    }

    if (style.gap !== undefined) props.push(`gap: ${style.gap}px`);

    if (style.width !== undefined) {
      props.push(`width: ${typeof style.width === 'number' ? style.width + 'px' : style.width === 'fill' ? '100%' : 'fit-content'}`);
    }
    if (style.height !== undefined) {
      props.push(`height: ${typeof style.height === 'number' ? style.height + 'px' : style.height === 'fill' ? '100%' : 'fit-content'}`);
    }

    if (style.borderRadius !== undefined) props.push(`border-radius: ${style.borderRadius}px`);
    if (style.borderColor) props.push(`border-color: ${style.borderColor}`);
    if (style.borderWidth !== undefined) {
      props.push(`border-width: ${style.borderWidth}px`);
      props.push('border-style: solid');
    }

    props.push(...this.spacingProps('padding', style.padding));
    props.push(...this.spacingProps('margin', style.margin));

    return props.join('; ');
  }

  private spacingProps(property: string, value?: number | [number, number, number, number]): string[] {
    if (value === undefined) return [];
    if (typeof value === 'number') return [`${property}: ${value}px`];
    return [`${property}: ${value.map(v => v + 'px').join(' ')}`];
  }

  private buildTransitionScript(transitions: PrototypeTransition[]): string {
    const lines = [
      '      (function() {',
      '        function showScreen(id) {',
      '          document.querySelectorAll("[data-screen]").forEach(function(s) { s.style.display = "none"; });',
      '          var target = document.getElementById("screen-" + id);',
      '          if (target) target.style.display = "block";',
      '        }',
      '',
    ];

    for (const t of transitions) {
      if (t.trigger === 'click' && t.targetElementId) {
        lines.push(`        document.addEventListener("DOMContentLoaded", function() {`);
        lines.push(`          var el = document.getElementById("${t.targetElementId}");`);
        lines.push(`          if (el) el.addEventListener("click", function() { showScreen("${t.toScreenId}"); });`);
        lines.push(`        });`);
      } else if (t.trigger === 'timer') {
        const duration = t.duration || 3000;
        lines.push(`        setTimeout(function() { showScreen("${t.toScreenId}"); }, ${duration});`);
      }
    }

    lines.push('      })();');
    return lines.join('\n');
  }

  private wrapDocument(title: string, bodyContent: string, meta?: { description?: string; viewport?: string }): string {
    const viewport = meta?.viewport || 'width=device-width, initial-scale=1.0';
    const descTag = meta?.description ? `\n    <meta name="description" content="${this.escapeAttr(meta.description)}">` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="${viewport}">${descTag}
    <title>${this.escapeHtml(title)}</title>
    <link rel="stylesheet" href="${this.tokensPath}">
    <style>
      /* Screen-specific styles — inline for self-containment */
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>`;
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  private escapeAttr(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
