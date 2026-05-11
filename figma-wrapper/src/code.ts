/// <reference types="@figma/plugin-typings" />
import { FigmaNodePayload, DocumentNodePayload, PageNodePayload, PrototypeInteraction } from '../schemas/figma-schema';

figma.showUI(__html__, { width: 400, height: 350 });

figma.ui.onmessage = async (msg: any) => {
  if (msg.type === 'render-nodes') {
    const payload = msg.payload as FigmaNodePayload;
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      
      let nodesToSelect: SceneNode[] = [];
      
      if (payload.type === 'DOCUMENT') {
        const docPayload = payload as DocumentNodePayload;
        if (docPayload.children) {
          for (const child of docPayload.children) {
            if (child.type === 'PAGE') {
              const page = figma.createPage();
              page.name = child.name || "Imported Page";
              figma.currentPage = page;
              if (child.children) {
                for (const nodeChild of child.children) {
                  const node = renderNode(nodeChild);
                  page.appendChild(node);
                  nodesToSelect.push(node);
                }
              }
            } else {
              const node = renderNode(child);
              figma.currentPage.appendChild(node);
              nodesToSelect.push(node);
            }
          }
        }
        
        if (docPayload.components) {
          for (const compPayload of docPayload.components) {
            const comp = figma.createComponent();
            applyBaseProperties(comp, compPayload);
            if (compPayload.children) {
              for (const child of compPayload.children) {
                comp.appendChild(renderNode(child));
              }
            }
            figma.currentPage.appendChild(comp);
            nodesToSelect.push(comp);
          }
        }
        
        if (docPayload.prototype_interactions) {
          applyInteractions(docPayload.prototype_interactions);
        }
      } else {
        const node = renderNode(payload);
        figma.currentPage.appendChild(node);
        nodesToSelect.push(node);
      }
      
      if (nodesToSelect.length > 0) {
        figma.currentPage.selection = nodesToSelect;
        figma.viewport.scrollAndZoomIntoView(nodesToSelect);
      }
      
      figma.notify("Nodes rendered successfully!");
    } catch (e: any) {
      figma.notify("Error rendering nodes: " + e.message, { error: true });
    }
  }
};

function renderNode(payload: FigmaNodePayload): SceneNode {
  switch (payload.type) {
    case 'FRAME':
      return createFrame(payload);
    case 'TEXT':
      return createText(payload);
    case 'RECTANGLE':
      return createRectangle(payload);
    case 'ELLIPSE':
      return createEllipse(payload);
    default:
      throw new Error(`Unsupported node type: ${(payload as any).type}`);
  }
}

function createFrame(payload: any): FrameNode {
  const frame = figma.createFrame();
  applyBaseProperties(frame, payload);
  
  if (payload.layoutMode) frame.layoutMode = payload.layoutMode;
  if (payload.primaryAxisSizingMode) frame.primaryAxisSizingMode = payload.primaryAxisSizingMode;
  if (payload.counterAxisSizingMode) frame.counterAxisSizingMode = payload.counterAxisSizingMode;
  if (payload.itemSpacing) frame.itemSpacing = payload.itemSpacing;
  
  if (payload.paddingLeft) frame.paddingLeft = payload.paddingLeft;
  if (payload.paddingRight) frame.paddingRight = payload.paddingRight;
  if (payload.paddingTop) frame.paddingTop = payload.paddingTop;
  if (payload.paddingBottom) frame.paddingBottom = payload.paddingBottom;
  
  if (payload.cornerRadius) frame.cornerRadius = payload.cornerRadius;
  
  if (payload.children && Array.isArray(payload.children)) {
    for (const childPayload of payload.children) {
      const child = renderNode(childPayload);
      frame.appendChild(child);
    }
  }
  
  return frame;
}

function createText(payload: any): TextNode {
  const text = figma.createText();
  applyBaseProperties(text, payload);
  
  if (payload.characters) {
    text.characters = payload.characters;
  }
  if (payload.fontSize) {
    text.fontSize = payload.fontSize;
  }
  if (payload.textAlignHorizontal) {
    text.textAlignHorizontal = payload.textAlignHorizontal;
  }
  
  return text;
}

function createRectangle(payload: any): RectangleNode {
  const rect = figma.createRectangle();
  applyBaseProperties(rect, payload);
  if (payload.cornerRadius) rect.cornerRadius = payload.cornerRadius;
  return rect;
}

function createEllipse(payload: any): EllipseNode {
  const ellipse = figma.createEllipse();
  applyBaseProperties(ellipse, payload);
  return ellipse;
}

function applyBaseProperties(node: any, payload: any) {
  if (payload.name) node.name = payload.name;
  if (payload.id) {
    node.setPluginData("originalId", payload.id);
  }
  if (payload.width && payload.height && node.resize) {
    node.resize(payload.width, payload.height);
  }
  if (payload.x !== undefined) node.x = payload.x;
  if (payload.y !== undefined) node.y = payload.y;
  if (payload.fills) node.fills = payload.fills;
  if (payload.strokes) node.strokes = payload.strokes;
  if (payload.strokeWeight) node.strokeWeight = payload.strokeWeight;
}

function applyInteractions(interactions: PrototypeInteraction[]) {
  const allNodes = figma.currentPage.findAll();
  for (const interaction of interactions) {
    const sourceNode = allNodes.find(n => n.getPluginData("originalId") === interaction.nodeId) as any;
    const destNode = allNodes.find(n => n.getPluginData("originalId") === interaction.action.destinationId);
    if (sourceNode && destNode && 'reactions' in sourceNode) {
      const existingReactions = sourceNode.reactions ? [...sourceNode.reactions] : [];
      existingReactions.push({
        action: {
          type: "NODE",
          destinationId: destNode.id,
          navigation: interaction.action.navigation,
          transition: interaction.action.transition ? {
            type: interaction.action.transition.type as any,
            direction: interaction.action.transition.direction as any,
            duration: interaction.action.transition.duration || 300
          } : null
        },
        trigger: {
          type: "ON_CLICK"
        }
      });
      sourceNode.reactions = existingReactions;
    }
  }
}
