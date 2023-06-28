import { NodeOrText } from "../utils/node";
import { EmojiConvertor } from 'emoji-js';

export function processUlNode(node: NodeOrText): NodeOrText {
  if ('name' in node && node.name === 'ul') {
    const iconInUl = node.attribs?.['icon'];
    const iconSize = node.attribs?.['size'];
    const className = node.attribs?.['class'];
    const hasIconInChildren = node.children?.some((child: NodeOrText) => child.name === 'li' && child.attribs?.['icon']);

    if (iconInUl || hasIconInChildren) {
      updateNodeStyle(node);

      // Update children based on the conditions
      node.children = node.children?.map((child: NodeOrText) => {
        if (child.name === 'li' && (iconInUl || child.attribs?.['icon'])) {
          updateLiChildren(child, iconInUl, iconSize, className  );
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

function updateLiChildren(child: NodeOrText, icon: string, iconSize: string, className?: string) {
  const iChild: NodeOrText = createIChild(child, icon, iconSize, className);
  const divChild: NodeOrText = createDivChild(child, child.children || []);
  child.children = [iChild, divChild];
  updateNodeRelations(iChild, divChild, child.children || []);
  if (!child.attribs) child.attribs = {};
  child.attribs['style'] = 'display: flex;';
}

function createIChild(parent: NodeOrText, icon: string, iconSize: string, className?: string): NodeOrText {
  const emoji = new EmojiConvertor();
  emoji.replace_mode = 'unified';
  emoji.allow_native = true;

  const emojiString = `:${icon}:`;
  const unicodeEmoji = emoji.replace_colons(emojiString);

  const isEmoji = unicodeEmoji !== emojiString;
  const localFileRegex = /^(\.\/)?[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+\.(jpg|png|gif|bmp|svg|jpeg)$/;
  const urlRegex = /^(http(s)?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  const isImage = !isEmoji && (localFileRegex.test(icon) || urlRegex.test(icon));
  const size = getSize(iconSize);

  let child: NodeOrText;

  if (isEmoji) {
    child = {
      type: 'tag',
      name: 'i',
      attribs: {
        ...className && { class: className },
        'aria-hidden': 'true',
        style: size.fontSize ? `font-size:${size.fontSize}; margin-right: 5px;` : 'margin-right: 5px;'
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
        style: `width: ${size.imageSize}; height: ${size.imageSize}; margin-right: 5px;`
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
        style: `padding:5px;margin-right:5px;${size.fontSize ? `font-size:${size.fontSize};` : ''}`
      },
      children: [],
      next: undefined,
      prev: undefined,
      parent: parent,
    };
  }
  return child;
}

function getSize(iconSize :string) {
  iconSize = (iconSize || 'xs').toLowerCase();

  switch (iconSize) {
    case 's':
      return { fontSize: '12px', imageSize: '30px' };
    case 'm':
      return { fontSize: '18px', imageSize: '35px' };
    case 'l':
      return { fontSize: '24px', imageSize: '50px' };
    case 'xl':
      return { fontSize: '30px', imageSize: '65px' };
    default: // 'xs'
      return { fontSize: undefined, imageSize: '25px' };
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
