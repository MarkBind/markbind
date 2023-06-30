import { IconSize } from "@primer/octicons";
import { NodeOrText } from "../utils/node";
import { EmojiConvertor } from 'emoji-js';

interface IconAttributes {
  icon?: string;
  iconSize?: string;
  className?: string;
}

export function processUlNode(node: NodeOrText): NodeOrText {
  const iconUl = node.attribs?.['icon'];
  const hasIconInChildren = node.children?.find((child: NodeOrText) => child.name === 'li' && child.attribs?.['icon']);
  if (iconUl == undefined && hasIconInChildren == undefined) return node;

  if ('name' in node && node.name === 'ul') {
    const iconAttributes: IconAttributes = {
      icon: iconUl,
      iconSize: node.attribs?.['size'],
      className: node.attribs?.['class']
    };

    // Delete the attributes after getting their values
    if (iconAttributes.icon) delete node.attribs?.['icon'];
    if (iconAttributes.iconSize) delete node.attribs?.['size'];
    if (iconAttributes.className) delete node.attribs?.['class'];



    let defaultLiIcon: IconAttributes = {};
    if (hasIconInChildren) {
      defaultLiIcon = {
        icon: hasIconInChildren.attribs?.['icon'],
        iconSize: hasIconInChildren.attribs?.['size'],
        className: hasIconInChildren.attribs?.['class']
      };
    }

    if (iconAttributes.icon || hasIconInChildren) {
      updateNodeStyle(node);

      // Update children based on the conditions
      node.children = node.children?.map((child: NodeOrText) => {
        if (child.name === 'li') {
          updateLiChildren(child, iconAttributes, defaultLiIcon);
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

function updateLiChildren(child: NodeOrText, parentIconAttributes: IconAttributes, defaultLiIconAttributes: IconAttributes) {
  // Get the child's attributes, these will override the parent's attributes
  const icon = child.attribs?.['icon'] || parentIconAttributes.icon || defaultLiIconAttributes.icon;
  const iconSize = child.attribs?.['size'] || parentIconAttributes.iconSize || defaultLiIconAttributes.iconSize;
  const className = child.attribs?.['class'] || parentIconAttributes.className || defaultLiIconAttributes.className;

  // Delete the child's attributes after getting their values
  if (child.attribs?.['icon']) delete child.attribs['icon'];
  if (child.attribs?.['size']) delete child.attribs['size'];
  if (child.attribs?.['class']) delete child.attribs['class'];

  const size = getSize(iconSize);

  const iChild: NodeOrText = createIChild(child, icon, size, className);
  const divChild: NodeOrText = createDivChild(child, child.children || []);
  child.children = [iChild, divChild];
  updateNodeRelations(iChild, divChild, child.children || []);
  if (!child.attribs) child.attribs = {};
  child.attribs['style'] = 'display: flex;';
}


function createIChild(parent: NodeOrText, icon: string, size: Size, className?: string): NodeOrText {
  const emoji = new EmojiConvertor();
  emoji.replace_mode = 'unified';
  emoji.allow_native = true;

  const emojiString = `:${icon}:`;
  const unicodeEmoji = emoji.replace_colons(emojiString);

  const isEmoji = unicodeEmoji !== emojiString;
  const localFileRegex = /^(\.\/)?[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+\.(jpg|png|gif|bmp|svg|jpeg)$/;
  const urlRegex = /^(http(s)?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  const isImage = !isEmoji && (localFileRegex.test(icon) || urlRegex.test(icon));

  let child: NodeOrText;
  const defaultSize = `width: ${size.squareSize}; height: ${size.squareSize}; 
          margin-right:5px;text-align:center;display:flex;align-items:center;`;

  if (isEmoji) {
    child = {
      type: 'tag',
      name: 'span',
      attribs: {
        ...className && { class: className },
        'aria-hidden': 'true',
        style: defaultSize + (size.fontSize ? `font-size:${size.fontSize}; margin-right: 5px;` : 'margin-right: 5px;'),
      },
      children: [{
        type: 'text',
        data: unicodeEmoji,
      }],
      next: undefined,
      prev: undefined,
      parent: parent
    };
  } else if (isImage) {
    const altText = icon.split('/').pop()?.split('.')[0] || '';
    child = {
      type: 'tag',
      name: 'img',
      attribs: {
        ...className && { class: className },
        src: icon,
        alt: altText,
        style: defaultSize + "margin-bottom: 1rem;",
      },
      children: [],
      next: undefined,
      prev: undefined,
      parent: parent,
    };
  } else {
    child = {
      type: 'tag',
      name: 'i',
      attribs: {
        class: className ? `${icon} ${className}` : icon,
        'aria-hidden': 'true',
        style: defaultSize + `margin-right:5px;${size.fontSize ? `font-size:${size.fontSize};` : ''}`
      },
      children: [],
      next: undefined,
      prev: undefined,
      parent: parent,
    };
  }
  return child;
}
type Size = {
  fontSize: string;
  imageSize: string;
  squareSize: string;
};

function getSize(iconSize: string) {
  iconSize = (iconSize || 'xs').toLowerCase();

  switch (iconSize) {
    case 's':
      return { fontSize: '18px', imageSize: '30px', squareSize: '30px' };
    case 'm':
      return { fontSize: '20px', imageSize: '40px', squareSize: '40px' };
    case 'l':
      return { fontSize: '24px', imageSize: '50px', squareSize: '50px' };
    case 'xl':
      return { fontSize: '28px', imageSize: '60px', squareSize: '60px' };
    default: // 'xs'
      return { fontSize: '16px', imageSize: '25px', squareSize: '25px' };
  }
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
