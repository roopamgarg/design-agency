export type FigmaNodeType = 'DOCUMENT' | 'PAGE' | 'FRAME' | 'TEXT' | 'RECTANGLE' | 'COMPONENT' | 'ELLIPSE';

export interface BaseNodePayload {
  type: FigmaNodeType;
  id?: string;
  name?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  fills?: SolidPaint[];
  strokes?: SolidPaint[];
  strokeWeight?: number;
}

export interface SolidPaint {
  type: 'SOLID';
  color: { r: number; g: number; b: number };
  opacity?: number;
}

export interface DocumentNodePayload extends BaseNodePayload {
  type: 'DOCUMENT';
  children?: FigmaNodePayload[];
  components?: ComponentNodePayload[];
  prototype_interactions?: PrototypeInteraction[];
}

export interface PageNodePayload extends BaseNodePayload {
  type: 'PAGE';
  children?: FigmaNodePayload[];
}

export interface ComponentNodePayload extends BaseNodePayload {
  type: 'COMPONENT';
  children?: FigmaNodePayload[];
}

export interface EllipseNodePayload extends BaseNodePayload {
  type: 'ELLIPSE';
}

export interface FrameNodePayload extends BaseNodePayload {
  type: 'FRAME';
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  cornerRadius?: number;
  children?: FigmaNodePayload[];
}

export interface TextNodePayload extends BaseNodePayload {
  type: 'TEXT';
  characters: string;
  fontSize?: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
}

export interface RectangleNodePayload extends BaseNodePayload {
  type: 'RECTANGLE';
  cornerRadius?: number;
}

export type FigmaNodePayload = 
  | DocumentNodePayload 
  | PageNodePayload 
  | FrameNodePayload 
  | TextNodePayload 
  | RectangleNodePayload
  | ComponentNodePayload
  | EllipseNodePayload;

export interface PrototypeInteraction {
  nodeId: string;
  action: {
    type: 'NODE';
    destinationId: string;
    navigation: 'NAVIGATE' | 'OVERLAY' | 'SWAP' | 'BACK';
    transition?: {
      type: 'MOVE_IN' | 'MOVE_OUT' | 'PUSH' | 'SLIDE_IN' | 'SLIDE_OUT' | 'DISSOLVE' | 'SMART_ANIMATE';
      direction?: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | 'NONE';
      duration?: number;
    }
  };
}