import cheerio from 'cheerio';
import get from 'lodash/get';
import { MbNode, NodeOrText } from '../utils/node';

const { processIconString } = require('../lib/markdown-it/plugins/markdown-it-icons');
const emojiDictionary = require('../lib/markdown-it/patches/markdown-it-emoji-fixed');

interface EmojiData {
  [key: string]: string;
}

const emojiData = emojiDictionary as unknown as EmojiData;

const ICON_ATTRIBUTES = ['icon', 'i-width', 'i-height', 'i-size', 'i-class'];

interface IconAttributes {
  icon?: string;
  className?: string;
  size?: string;
  width?: string;
  height?: string;
}

function classifyIcon(icon: string) {
  const isEmoji = Object.prototype.hasOwnProperty.call(emojiData, icon);
  const localFileRegex = new RegExp([
    '^(./)?',
    '[a-zA-Z0-9-._~:/?#[@!$&\'()*+,;=%]+',
    '.(jpg|png|gif|bmp|svg|jpeg|webp|avif)$',
  ].join(''));

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

    spanContent = cheerio('<span></span>').append(img).css({
      'padding-bottom': '0.3em',
      'padding-top': '0.3em',
    });
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
    'flex-shrink': '0',
    height: '100%',
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
    width: node.attribs['i-width'] !== undefined ? node.attribs['i-width'] : iconAttributes.width,
    height: node.attribs['i-height'] !== undefined ? node.attribs['i-height'] : iconAttributes.height,
    size: node.attribs['i-size'] !== undefined ? node.attribs['i-size'] : iconAttributes.size,
    className: node.attribs['i-class'] !== undefined
      ? node.attribs['i-class']
      : iconAttributes.className,
  };
};

const updateUlNode = (node: MbNode, icon: IconAttributes) => {
  if (get(node, 'attribs') && icon) {
    node.attribs.icon = icon.icon ?? node.attribs.icon;
    node.attribs['i-width'] = icon.width ?? node.attribs['i-width'];
    node.attribs['i-height'] = icon.height ?? node.attribs['i-height'];
    node.attribs['i-size'] = icon.size ?? node.attribs['i-size'];
    node.attribs['i-class'] = icon.className ?? node.attribs['i-class'];
  }
};

const deleteAttributes = (node: MbNode, attributes: string[]) => {
  attributes.forEach((attr) => {
    delete node.attribs[attr];
  });
};

function updateLi(child: NodeOrText, iconAttributes: IconAttributes) {
  const childNode = child as MbNode;

  const curLiIcon = getIconAttributes(childNode, iconAttributes);

  deleteAttributes(childNode, ICON_ATTRIBUTES);

  // Create a new div and span
  const div = cheerio('<div></div>');
  const iconSpan = createIconSpan(curLiIcon!);

  div.append(cheerio(child.children).remove());

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

export function waterfallModel(node: NodeOrText) {
  const iconAttrs: {
    key: number, value: {
      isFirst: boolean, iconAttr: IconAttributes | null, level: number
    }
  }[] = [];

  function handleChild(child: MbNode, iconAttrValue: {
    isFirst: boolean, iconAttr: IconAttributes | null, level: number
  }) {
    if (child.name === 'li') {
      const liChild = child as MbNode;
      if (iconAttrValue.isFirst) {
        iconAttrValue.iconAttr = getIconAttributes(liChild);
        iconAttrValue.isFirst = false;
      } else if (iconAttrValue.iconAttr) {
        iconAttrValue.iconAttr = getIconAttributes(liChild, iconAttrValue.iconAttr);
      }
    }
  }

  function dfs(currentNode: NodeOrText, level: number = 0) {
    if (!isRelevantNode(currentNode)) return;

    if (!iconAttrs[level]) {
      iconAttrs[level] = { key: level, value: { isFirst: true, iconAttr: null, level } };
    }

    const ulNode = currentNode as MbNode;
    const liNodes = ulNode.children.filter(child => child.name === 'li');

    liNodes.forEach((liNode) => {
      const ulLiChildren = liNode.children?.filter(child => child.name === 'ul');
      if (ulLiChildren && ulLiChildren.length > 0) {
        ulLiChildren.forEach((ulLiChildNode) => {
          const iconAttrValue = iconAttrs[level].value;

          if (ulLiChildNode.children) {
            ulLiChildNode.children.forEach(child => handleChild(child as MbNode, iconAttrValue));
          }

          if (iconAttrValue.iconAttr) {
            updateUlNode(ulLiChildNode as MbNode, iconAttrValue.iconAttr);
          }

          // Traverse the children if any
          dfs(ulLiChildNode, level + 1);
        });
      }
    });
  }

  dfs(node, 1);
}

export function processUlNode(node: NodeOrText): NodeOrText {
  if (!isRelevantNode(node)) return node;

  const ulNode = node as MbNode;
  waterfallModel(ulNode);

  let defaultIcon = getIconAttributes(ulNode);
  let isFirst = true;

  if (defaultIcon) {
    // Remove the icon-related attributes
    deleteAttributes(ulNode, ICON_ATTRIBUTES);
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
      updateLi(curLi, defaultIcon);
    }
  }

  return ulNode;
}
