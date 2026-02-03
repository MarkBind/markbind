import { encode } from 'html-entities';
import { MbNode, NodeOrText } from '../utils/node';

export type CardStackTagConfig = { name: string; color?: string };

function isTag(child: NodeOrText): child is MbNode {
  return child.type === 'tag' && (child as MbNode).name === 'tag';
}

function isTags(child: NodeOrText): child is MbNode {
  return child.type === 'tag' && (child as MbNode).name === 'tags';
}

export function processCardStackAttributes(node: MbNode) {
  // Look for a <tags> child element
  if (!node.children) {
    return;
  }

  const tagsNodeIndex = node.children.findIndex(
    child => isTags(child),
  );

  if (tagsNodeIndex === -1) {
    return;
  }

  const tagsNode = node.children[tagsNodeIndex] as MbNode;
  const tagConfigs: Array<CardStackTagConfig> = [];

  // Parse each <tag> element
  if (tagsNode.children) {
    tagsNode.children.forEach((child) => {
      if (isTag(child)) {
        if (child.attribs?.name) {
          const config: CardStackTagConfig = {
            name: child.attribs.name,
            ...(child.attribs.color && { color: child.attribs.color }),
          };
          tagConfigs.push(config);
        }
      }
    });
  }

  // Add tag-configs as a prop if we found any tags
  if (tagConfigs.length > 0) {
    const jsonString = JSON.stringify(tagConfigs);
    // Replace double quotes with HTML entities to avoid SSR warnings
    const escapedJson = encode(jsonString);
    node.attribs['data-tag-configs'] = escapedJson;
  }

  // Remove the <tags> node from the DOM tree
  node.children.splice(tagsNodeIndex, 1);
}
