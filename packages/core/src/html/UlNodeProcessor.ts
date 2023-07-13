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

  let spanNode;

  if (isEmoji) {
    const span = `<span aria-hidden="true">${unicodeEmoji}</span>`;
    spanNode = cheerio(span).css({ 'font-size': iconAttrs.size });
    spanNode.addClass(iconAttrs.className || '');
  } else if (isImage) {
    const img = cheerio(`<img src="${iconAttrs.icon}" alt="Icon">`).css({ width: iconAttrs.width, height: iconAttrs.height });
    img.addClass(iconAttrs.className || '');

    spanNode = cheerio('<span></span>').append(img).css({ 'padding-bottom': '0.3em' });
  } else {
    const span = processIconString(iconAttrs.icon);
    spanNode = cheerio(span).css({ 'font-size': 'unset', 'min-width': '16px'});
    spanNode = spanNode.css({ 'font-size': iconAttrs.size });
    spanNode.addClass(iconAttrs.className || '');

  }

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

// // Helper function to get icon attributes
// const getIconAttributes = (node: MbNode, defaultIcon: IconAttributes): IconAttributes | null => {
//   if (node.attribs && defaultIcon.icon !== undefined) {
//     return {
//       icon: node.attribs.icon || defaultIcon.icon,
//       width: node.attribs.width || defaultIcon.width,
//       height: node.attribs.height || defaultIcon.height,
//       size: node.attribs.size || defaultIcon.size,
//       className: node.attribs.class || defaultIcon.className,
//     };
//   }

//   return null;
// };

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
    className: defaultIcon?.className
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

export function waterfallModel(node: NodeOrText): NodeOrText {
  if (!('name' in node && node.name === 'ul') && !node.children) {
    return node;
  }

  const ulNode = node as MbNode;
  let isFirstUl = true;
  let defaultIcon: IconAttributes = {};

  for (let i = 0; i < ulNode.children.length; i += 1) {
    const liNode = ulNode.children[i];
    if (liNode.name === 'li') {
      // Find first 'ul' in 'li'
      const firstUl = liNode.children?.find(child => child.name === 'ul') as MbNode;

      if (firstUl) {
        if (!firstUl.children && isFirstUl) {
          return node;
        }

        // Find first 'li' in 'ul' that has an icon
        const iconLi = firstUl.children?.find((child) => {
          if (child.name === 'li') {
            const innerNode = child as MbNode;
            return innerNode.attribs && innerNode.attribs.icon !== undefined;
          }
          return false;
        }) as MbNode;

        if (iconLi) {
          const iconAttr = getIconAttributes(iconLi, defaultIcon);

          if (iconAttr) {
            defaultIcon = iconAttr;
          }
        } else if (isFirstUl) {
          // No 'li' with icon in the first 'ul'
          return node;
        }

        if (!isFirstUl) {
          updateUlNode(firstUl, defaultIcon);
        }

        isFirstUl = false;
      }
    }
  }

  return node;
}

export function processUlNode(node: NodeOrText): NodeOrText {
  if (!('name' in node && node.name === 'ul') && !node.children) {
    return node;
  }

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
