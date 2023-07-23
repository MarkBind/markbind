import cheerio from 'cheerio';
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

type IconAttributeDetail = {
  isFirst: boolean;
  iconAttr: IconAttributes | null;
  level: number;
};

type IconAttributeWrapper = {
  key: number;
  value: IconAttributeDetail;
};

function classifyIcon(icon: string) {
  const isEmoji = Object.prototype.hasOwnProperty.call(emojiData, icon);

  return {
    isEmoji,
    unicodeEmoji: isEmoji
      ? emojiData[icon]
      : undefined,
  };
}

function createIconSpan(iconAttrs: IconAttributes): cheerio.Cheerio {
  const {
    isEmoji,
    unicodeEmoji,
  } = classifyIcon(iconAttrs.icon!);

  let spanContent;
  if (isEmoji) {
    spanContent = `<span aria-hidden="true">${unicodeEmoji}</span>`;
  } else {
    spanContent = processIconString(iconAttrs.icon);
  }

  let spanNode;
  if (spanContent === null) {
    const img = cheerio(`<img src='${iconAttrs.icon}' alt='Icon'>`)
      .css({ width: iconAttrs.width, height: iconAttrs.height, display: 'inline-block' })
      .addClass(iconAttrs.className || '');
    img.append('\u200B');

    spanContent = cheerio('<span></span>').append(img).css({
      'padding-bottom': '0.3em',
      'padding-top': '0.3em',
    });
    spanNode = cheerio(spanContent).css({ 'font-size': 'unset' });
  } else {
    spanNode = cheerio(spanContent).css({ 'font-size': 'unset' });
    spanNode = spanNode.css({ 'font-size': iconAttrs.size }).addClass(iconAttrs.className || '');
  }
  // Add invisible character to avoid the element from being empty
  spanNode.append('\u200B');
  return spanNode.css({
    'line-height': 'unset',
    'margin-inline-end': '0.3em',
    'flex-shrink': '0',
    'align-self': 'flex-start',
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

  return {
    icon: node.attribs.icon !== undefined ? node.attribs.icon : defaultIcon?.icon,
    width: node.attribs['i-width'] !== undefined ? node.attribs['i-width'] : defaultIcon?.width,
    height: node.attribs['i-height'] !== undefined ? node.attribs['i-height'] : defaultIcon?.height,
    size: node.attribs['i-size'] !== undefined ? node.attribs['i-size'] : defaultIcon?.size,
    className: node.attribs['i-class'] !== undefined ? node.attribs['i-class'] : defaultIcon?.className,
  };
};

const deleteAttributes = (node: MbNode, attributes: string[]) => {
  attributes.forEach((attr) => {
    delete node.attribs[attr];
  });
};

function updateLi(child: NodeOrText, iconAttributes: IconAttributes) {
  const childNode = child as MbNode;
  if (
    iconAttributes.icon === undefined
  ) return;
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

function handleChild(child: MbNode, iconAttrValue: IconAttributeDetail) {
  if (child.name === 'li') {
    const liChild = child as MbNode;
    if (iconAttrValue.isFirst) {
      iconAttrValue.iconAttr = getIconAttributes(liChild);
      iconAttrValue.isFirst = false;
    } else if (iconAttrValue.iconAttr) {
      iconAttrValue.iconAttr = getIconAttributes(liChild, iconAttrValue.iconAttr);
    }
    updateLi(child, iconAttrValue.iconAttr ?? {});
  }
}

export function processUlNode(node: NodeOrText) {
  const nodeAsMbNode = node as MbNode;
  if (nodeAsMbNode.attribs.isIconListProcessed === 'true') {
    delete nodeAsMbNode.attribs.isIconListProcessed;
    return;
  }

  const iconAttrs: IconAttributeWrapper[] = [];

  function dfs(currentNode: NodeOrText, level: number) {
    if (!iconAttrs[level]) {
      iconAttrs[level] = { key: level, value: { isFirst: true, iconAttr: null, level } };
    }

    const ulNode = currentNode as MbNode;
    const liNodes = ulNode.children.filter(child => child.name === 'li');

    liNodes.forEach((liNode) => {
      const ulChildren = liNode.children?.filter(child => child.name === 'ul');
      handleChild(liNode as MbNode, iconAttrs[level].value);

      if (ulChildren && ulChildren.length > 0) {
        ulChildren.forEach((ulChildNode) => {
          // Traverse the children if any
          dfs(ulChildNode, level + 1);

          // Insert an `isIconListProcessed` flag attribute to the node.
          if (ulChildNode.attribs) {
            ulChildNode.attribs.isIconListProcessed = 'true';
          }
        });
      }
    });
    if (iconAttrs[level].value.iconAttr !== null) {
      updateNodeStyle(ulNode);
    }
  }
  dfs(node, 0);
}
