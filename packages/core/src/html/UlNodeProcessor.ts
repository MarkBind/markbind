import cheerio from 'cheerio';
import { MbNode, NodeOrText } from '../utils/node';

const { processIconString } = require('../lib/markdown-it/plugins/markdown-it-icons');
const emojiDictionary = require('../lib/markdown-it/patches/markdown-it-emoji-fixed');

interface EmojiData {
  [key: string]: string;
}

const emojiData = emojiDictionary as unknown as EmojiData;

interface IconAttributes {
  icon?: string;
  className?: string;
  size?: string;
  width?: string;
  height?: string;
}

function classifyIcon(icon: string) {
  const isEmoji = Object.prototype.hasOwnProperty.call(emojiData, icon);
  const localFileRegex = /^(\.\/)?[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+\.(jpg|png|gif|bmp|svg|jpeg)$/;
  const urlRegex = /^(http(s)?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  const isImage = !isEmoji && (localFileRegex.test(icon) || urlRegex.test(icon));
  return {
    isEmoji,
    isImage,
    unicodeEmoji: isEmoji
      ? emojiData[icon]
      : undefined,
  };
}

function createIconSpan(iconAttrs: IconAttributes): cheerio.Cheerio {
  const {
    isEmoji,
    isImage,
    unicodeEmoji,
  } = classifyIcon(iconAttrs.icon!);

  let spanContent;

  if (isEmoji) {
    spanContent = `<span aria-hidden="true">${unicodeEmoji}</span>`;
  } else if (isImage) {
    const img = cheerio(`<img src='${iconAttrs.icon}' alt='Icon'>`)
      .css({ width: iconAttrs.width, height: iconAttrs.height, display: 'inline-block' })
      .addClass(iconAttrs.className || '');
    img.append('\u200B');

    spanContent = cheerio('<span></span>').append(img).css({ 'padding-bottom': '0.3em' });
  } else {
    spanContent = processIconString(iconAttrs.icon);
  }

  let spanNode = cheerio(spanContent).css({ 'font-size': 'unset', 'min-width': '16px' });

  if (!isImage) {
    spanNode = spanNode.css({ 'font-size': iconAttrs.size }).addClass(iconAttrs.className || '');
  }
  // Add invisible character to avoid the element from being empty
  spanNode.append('\u200B');
  return spanNode.css({
    'line-height': 'unset',
    'margin-inline-end': '0.3em',
    height: '100%',
    'flex-shrink': '0',
  });
}

function updateNodeStyle(node: NodeOrText) {
  const nodeCheerio = cheerio(node);

  nodeCheerio.css({
    'list-style-type': 'none',
    'padding-inline-start': '0px',
  });
}

const getIconAttributes = (node: MbNode, defaultIcon?: IconAttributes): IconAttributes | null => {
  // If node.attribs doesn't exist, return null immediately
  if (!node.attribs || (defaultIcon?.icon === undefined && node.attribs.icon === undefined)) {
    return null;
  }

  // Prepare an object with default properties
  const iconAttributes: IconAttributes = {
    icon: defaultIcon?.icon,
    width: defaultIcon?.width,
    height: defaultIcon?.height,
    size: defaultIcon?.size,
    className: defaultIcon?.className,
  };

  // Overwrite defaults with the actual attributes from node if they exist
  return {
    ...iconAttributes,
    icon: node.attribs.icon !== undefined ? node.attribs.icon : iconAttributes.icon,
    width: node.attribs.width !== undefined ? node.attribs.width : iconAttributes.width,
    height: node.attribs.height !== undefined ? node.attribs.height : iconAttributes.height,
    size: node.attribs.size !== undefined ? node.attribs.size : iconAttributes.size,
    className: node.attribs.class !== undefined ? node.attribs.class : iconAttributes.className,
  };
};

// Helper function to update UL node
const updateUlNode = (node: MbNode, icon: IconAttributes) => {
  if (node.attribs) {
    node.attribs.icon = icon.icon;
    node.attribs.width = icon.width;
    node.attribs.height = icon.height;
    node.attribs.size = icon.size;
    node.attribs.class = icon.className;
  }
};

function updateLiChildren(child: NodeOrText, defaultLiIconAttributes: IconAttributes) {
  const childNode = child as MbNode;

  const curLiIcon = getIconAttributes(childNode, defaultLiIconAttributes);

  ['icon', 'width', 'height', 'size', 'class'].forEach((attr) => {
    delete childNode.attribs[attr];
  });

  const children = cheerio(child.children);

  // Create a new div and span
  const div = cheerio('<div></div>');
  const iconSpan = createIconSpan(curLiIcon!);

  // Append each child to the div
  children.each((index, elem) => {
    div.append(cheerio(elem));
  });

  // Empty the child
  cheerio(child).empty();

  // Append iconSpan and div to the child
  cheerio(child).append(iconSpan);
  cheerio(child).append(div);

  cheerio(child).css({
    display: 'flex',
  });
}

function isRelevantNode(node: NodeOrText): boolean {
  return 'name' in node && node.name === 'ul' && Boolean(node.children);
}

function updateFirstUl(ulNode: MbNode): IconAttributes | null {
  let isFirstUlLiChild = true;
  let defaultIcon: IconAttributes | null = null;

  for (let i = 0; i < ulNode.children.length; i += 1) {
    const ulChild = ulNode.children[i];
    if (ulChild.name === 'li') {
      if (isFirstUlLiChild) {
        const iconAttr = getIconAttributes(ulChild as MbNode);
        if (iconAttr) {
          defaultIcon = iconAttr;
          isFirstUlLiChild = false;
        } else return null;
      } else if (defaultIcon) {
        defaultIcon = getIconAttributes(ulChild as MbNode, defaultIcon);
      }
    }
  }

  return defaultIcon;
}

function updateRestUl(ulNode: MbNode, defaultIcon: IconAttributes): IconAttributes {
  updateUlNode(ulNode, defaultIcon);

  const updatedIcon = ulNode.children
    .filter(ulChild => ulChild.name === 'li')
    .reduce((icon, ulChild) => getIconAttributes(ulChild as MbNode, icon)!, defaultIcon);

  return updatedIcon;
}

export function waterfallModel(node: NodeOrText): NodeOrText {
  if (!isRelevantNode(node)) return node;

  const ulNode = node as MbNode;
  let defaultIcon: IconAttributes | null = {};
  let isFirstUl = true;

  const liNodes = ulNode.children.filter(child => child.name === 'li');

  for (let i = 0; i < liNodes.length; i += 1) {
    const ulChildren = liNodes[i].children?.filter(child => child.name === 'ul');

    if (ulChildren) {
      for (let j = 0; j < ulChildren.length; j += 1) {
        const ulChildNode = ulChildren[j] as MbNode;

        if (isFirstUl) {
          defaultIcon = updateFirstUl(ulChildNode);
          if (!defaultIcon) return node;
          isFirstUl = false;
        } else {
          defaultIcon = updateRestUl(ulChildNode, defaultIcon);
        }
      }
    }
  }
  return node;
}

export function processUlNode(node: NodeOrText): NodeOrText {
  if (!isRelevantNode(node)) return node;

  const ulNode = node as MbNode;
  waterfallModel(ulNode);

  let defaultIcon = getIconAttributes(ulNode);
  let isFirst = true;

  if (defaultIcon) {
    // Remove the icon-related attributes
    ['icon', 'width', 'height', 'size', 'class'].forEach((attr) => {
      delete ulNode.attribs[attr];
    });
  } else {
    defaultIcon = {};
  }

  for (let i = 0; i < ulNode.children.length; i += 1) {
    const child = ulNode.children[i];

    if (child.name === 'li') {
      const curLi = child as MbNode;
      const curLiIcon = getIconAttributes(curLi, defaultIcon);

      if (isFirst && !curLiIcon && !defaultIcon.icon) return ulNode;

      if (isFirst) {
        isFirst = false;
        updateNodeStyle(ulNode);
      }

      defaultIcon = curLiIcon || defaultIcon;
      updateLiChildren(curLi, defaultIcon);
    }
  }

  return ulNode;
}
