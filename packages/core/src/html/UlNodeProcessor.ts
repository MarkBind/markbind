import { NodeOrText } from "../utils/node";
export function processUlNode(node: NodeOrText): NodeOrText {
  if ('name' in node && node.name === 'ul') {
    const iconInUl = node.attribs?.['icon'];
    const iconSize = node.attribs?.['size'];
    const hasIconInChildren = node.children?.some((child: NodeOrText) => child.name === 'li' && child.attribs?.['icon']);

    if (iconInUl || hasIconInChildren) {
      updateNodeStyle(node);

      // Update children based on the conditions
      node.children = node.children?.map((child: NodeOrText) => {
        if (child.name === 'li' && (iconInUl || child.attribs?.['icon'])) {
          updateLiChildren(child, iconInUl, iconSize  );
        }
        return child;
      }) || [];
    }
  }

  // If it's not a 'ul' node, return the node as is
  return node;
}

function updateNodeStyle(node: NodeOrText) {
  // Initialize styles object
  let styleObject = getStyleObject(node);

  // Add or overwrite list-style-type and display
  styleObject['list-style-type'] = 'none';
  styleObject['padding-left'] = '0';
  // Ensure node.attribs is defined before use
  if (!node.attribs) node.attribs = {};

  // Recreate style string and assign to style attribute
  node.attribs['style'] = createStyleString(styleObject);
}

function updateLiChildren(child: NodeOrText, icon: string, iconSize: string) {
  const iChild: NodeOrText = createIChild(child, icon, iconSize);
  const divChild: NodeOrText = createDivChild(child, child.children || []);
  child.children = [iChild, divChild];
  updateNodeRelations(iChild, divChild, child.children || []);
  if (!child.attribs) child.attribs = {};
  child.attribs['style'] = 'display: flex;';
}

function createIChild(parent: NodeOrText, icon: string, iconSize: string ): NodeOrText {
  return {
    type: 'tag',
    name: 'i',
    attribs: { class: icon, 'aria-hidden': 'true', style: `padding:5px;font-size:${iconSize}` },
    children: [],
    next: undefined,
    prev: undefined,
    parent: parent
  };
}

function createDivChild(parent: NodeOrText, children: NodeOrText[]): NodeOrText {
  return {
    type: 'tag',
    name: 'div',
    attribs: {},
    children: children,
    next: undefined,
    prev: undefined,
    parent: parent
  };
}

function updateNodeRelations(iChild: NodeOrText, divChild: NodeOrText, children: NodeOrText[]): void {
  iChild.next = divChild;
  divChild.prev = iChild;

  children.forEach(child => {
    child.parent = divChild;
  });
}


function getStyleObject(node: NodeOrText): { [key: string]: string } {
  let styleObject: { [key: string]: string } = {};
  if (node.attribs?.['style']) {
    const style = node.attribs['style'];
    styleObject = style.split(';').reduce((acc: Record<string, string>, rule: string) => {
      const [property, value] = rule.split(':').map((str: string) => str.trim());
      if (property) acc[property] = value;
      return acc;
    }, {});
  }
  return styleObject;
}

function createStyleString(styleObject: { [key: string]: string }): string {
  return Object.entries(styleObject).map(([property, value]: [string, string]) => `${property}: ${value}`).join('; ');
}
