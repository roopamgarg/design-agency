import { AgnosticComponent, AgnosticStyle } from '../schemas/agnostic-schema';
import { FigmaNodePayload, FrameNodePayload, TextNodePayload, RectangleNodePayload, SolidPaint } from '../schemas/figma-schema';

/**
 * Figma Integration Agent - Translator
 * 
 * This module establishes the integration pattern. It consumes the agnostic JSON schemas 
 * from the core pipeline and translates them into the specialized Figma payload.
 */

export class FigmaTranslator {
  
  public translate(component: AgnosticComponent): FigmaNodePayload {
    switch (component.type) {
      case 'container':
      case 'button':
        return this.translateToFrame(component);
      case 'text':
        return this.translateToText(component);
      case 'image':
      case 'input':
        return this.translateToRectangle(component); // simplified for this example
      default:
        throw new Error(`Unsupported agnostic component type: ${component.type}`);
    }
  }

  private translateToFrame(comp: AgnosticComponent): FrameNodePayload {
    const style = comp.style || {};
    
    const frame: FrameNodePayload = {
      type: 'FRAME',
      name: comp.name,
      layoutMode: style.layout === 'row' ? 'HORIZONTAL' : (style.layout === 'column' ? 'VERTICAL' : 'NONE'),
      cornerRadius: style.borderRadius,
      itemSpacing: style.gap,
    };

    if (style.backgroundColor) {
      frame.fills = [this.parseColor(style.backgroundColor)];
    }

    // Handle padding array or number
    if (typeof style.padding === 'number') {
      frame.paddingTop = frame.paddingRight = frame.paddingBottom = frame.paddingLeft = style.padding;
    } else if (Array.isArray(style.padding) && style.padding.length === 4) {
      [frame.paddingTop, frame.paddingRight, frame.paddingBottom, frame.paddingLeft] = style.padding;
    }

    frame.children = [];

    // If it's a button and has text, create a child text node implicitly
    if (comp.type === 'button' && comp.text) {
      frame.children.push({
        type: 'TEXT',
        name: 'Label',
        characters: comp.text,
        fontSize: style.fontSize || 14,
        fills: style.color ? [this.parseColor(style.color)] : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]
      } as TextNodePayload);
    }

    if (comp.children) {
      frame.children.push(...comp.children.map(child => this.translate(child)));
    }

    return frame;
  }

  private translateToText(comp: AgnosticComponent): TextNodePayload {
    const style = comp.style || {};
    return {
      type: 'TEXT',
      name: comp.name,
      characters: comp.text || '',
      fontSize: style.fontSize || 14,
      textAlignHorizontal: style.textAlign ? style.textAlign.toUpperCase() as any : 'LEFT',
      fills: style.color ? [this.parseColor(style.color)] : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]
    };
  }

  private translateToRectangle(comp: AgnosticComponent): RectangleNodePayload {
    const style = comp.style || {};
    const rect: RectangleNodePayload = {
      type: 'RECTANGLE',
      name: comp.name,
      cornerRadius: style.borderRadius
    };
    if (style.backgroundColor) {
      rect.fills = [this.parseColor(style.backgroundColor)];
    }
    return rect;
  }

  private parseColor(hex: string): SolidPaint {
    // Basic hex parsing to figma rgb (0-1 range)
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    return {
      type: 'SOLID',
      color: { r, g, b }
    };
  }
}
