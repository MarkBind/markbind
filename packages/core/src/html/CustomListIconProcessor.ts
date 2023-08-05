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
  iconAttrs: IconAttributes | null;
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
    spanNode = cheerio(spanContent).css({ 'font-size': 'unset', 'min-width': '16px' });
  } else {
    spanNode = cheerio(spanContent).css({ 'font-size': 'unset', 'min-width': '16px' });
    spanNode = spanNode.css({ 'font-size': iconAttrs.size }).addClass(iconAttrs.className || '');
  }
  // Add invisible character to avoid the element from being empty
  spanNode.append('\u200B');
  return spanNode.css({
    'line-height': 'unset',
    'margin-inline-end': '0.35em',
    'align-self': 'flex-start',
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

// If an item has a specified icon, that icon will be used for it and for subsequent
// items at that level to prevent duplication of icons attribute declarations.
const getIconAttributes = (node: MbNode, iconAttrsSoFar?: IconAttributes):
IconAttributes | null => {
  if (iconAttrsSoFar?.icon === undefined && node.attribs.icon === undefined) {
    return null;
  }

  return {
    icon: node.attribs.icon !== undefined ? node.attribs.icon : iconAttrsSoFar?.icon,
    width: node.attribs['i-width'] !== undefined ? node.attribs['i-width'] : iconAttrsSoFar?.width,
    height: node.attribs['i-height'] !== undefined ? node.attribs['i-height'] : iconAttrsSoFar?.height,
    size: node.attribs['i-size'] !== undefined ? node.attribs['i-size'] : iconAttrsSoFar?.size,
    className: node.attribs['i-class'] !== undefined ? node.attribs['i-class'] : iconAttrsSoFar?.className,
  };
};

const deleteAttributes = (node: MbNode, attributes: string[]) => {
  attributes.forEach((attr) => {
    delete node.attribs[attr];
  });
};

function updateLi(node: MbNode, iconAttributes: IconAttributes) {
  if (
    iconAttributes.icon === undefined
  ) return;
  const curLiIcon = getIconAttributes(node, iconAttributes);

  deleteAttributes(node, ICON_ATTRIBUTES);

  // Create a new div and span
  const div = cheerio('<div></div>');
  const iconSpan = createIconSpan(curLiIcon!);

  div.append(cheerio(node.children).remove());

  // Append iconSpan and div to the child
  cheerio(node).append(iconSpan);
  cheerio(node).append(div);

  cheerio(node).css({
    display: 'flex',
  });
}

// This function ensures the first item at that level must also be customized.
// If not, the list will be invalidated and default bullets will be used.
// This is to prevent unintentional mixing of standard and customized lists.
// See https://github.com/MarkBind/markbind/pull/2316#discussion_r1255364486 for more details.
function handleLiNode(node: MbNode, iconAttrValue: IconAttributeDetail) {
  if (iconAttrValue.isFirst) {
    iconAttrValue.iconAttrs = getIconAttributes(node);
    iconAttrValue.isFirst = false;
  } else if (iconAttrValue.iconAttrs) {
    iconAttrValue.iconAttrs = getIconAttributes(node, iconAttrValue.iconAttrs);
  }
  updateLi(node, iconAttrValue.iconAttrs ?? {});
}

export function processUlNode(node: NodeOrText) {
  const nodeAsMbNode = node as MbNode;
  if (nodeAsMbNode.attribs.isIconListProcessed === 'true') {
    delete nodeAsMbNode.attribs.isIconListProcessed;
    return;
  }

  const iconAttrs: IconAttributeDetail[] = [];
  function dfs(currentNode: NodeOrText, level: number) {
    if (!iconAttrs[level]) {
      iconAttrs[level] = { isFirst: true, iconAttrs: null };
    }

    const ulNode = currentNode as MbNode;
    const liNodes = ulNode.children.filter(child => child.name === 'li');

    liNodes.forEach((liNode) => {
      const ulChildren = liNode.children?.filter(child => child.name === 'ul');
      handleLiNode(liNode as MbNode, iconAttrs[level]);

      ulChildren?.forEach((ulChildNode) => {
        // Traverse the children if any
        dfs(ulChildNode, level + 1);

        // Insert an `isIconListProcessed` flag attribute to the node.
        if (ulChildNode.attribs) {
          ulChildNode.attribs.isIconListProcessed = 'true';
        }
      });
    });
    if (iconAttrs[level].iconAttrs !== null) {
      updateNodeStyle(ulNode);
    }
  }
  dfs(node, 0);
}
