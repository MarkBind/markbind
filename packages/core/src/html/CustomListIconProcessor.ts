import cheerio from 'cheerio';
import { MbNode, NodeOrText } from '../utils/node';
import * as logger from '../utils/logger';

const { processIconString } = require('../lib/markdown-it/plugins/markdown-it-icons');
const emojiDictionary = require('../lib/markdown-it/patches/markdown-it-emoji-fixed');

interface EmojiData {
  [key: string]: string;
}

const emojiData = emojiDictionary as unknown as EmojiData;
const ICON_ATTRIBUTES
    = ['icon', 'i-width', 'i-height', 'i-size', 'i-class', 'i-spacing', 'text', 't-size', 't-class', 'once'];

interface IconAttributes {
  icon?: string;
  iconClassName?: string;
  iconSize?: string;
  width?: string;
  height?: string;
  text?: string;
  textClassName?: string;
  textSize?: string;
  spacing?: string;
  once?: boolean;
}

class TextsManager {
  texts: string[] = [];
  nextTextPointer: number = 0;
  constructor() {
    this.texts = [];
  }

  isInUse() {
    return this.texts.length > 0;
  }

  stopUsage() {
    this.texts = [];
    this.nextTextPointer = 0;
  }

  next(): string {
    if (this.texts.length === 0) {
      throw new Error('No texts');
    }
    const next = this.texts[this.nextTextPointer];
    if (this.nextTextPointer < this.texts.length - 1) {
      this.nextTextPointer += 1;
    }
    return next;
  }

  resetTexts(texts: string[]) {
    this.texts = texts;
    this.nextTextPointer = 0;
  }
}

type IconAttributeDetail = {
  isFirst: boolean;
  addIcons: boolean;
  textsManager: TextsManager;
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

function createTextSpan(iconAttrs: IconAttributes): cheerio.Cheerio | null {
  if (iconAttrs.text === undefined || iconAttrs.text.length === 0) {
    return null;
  }
  const spanNode = cheerio(`<span aria-hidden="true">${iconAttrs.text}</span>`)
    .css({
      'font-size': iconAttrs.textSize,
    }).addClass(iconAttrs.textClassName || '');
  const iconSpacing = iconAttrs.spacing || '0.35em';
  return spanNode.css({
    'line-height': 'unset',
    'margin-inline-end': iconSpacing,
    'align-self': 'flex-start',
    'flex-shrink': '0',
  });
}

function createIconSpan(iconAttrs: IconAttributes): cheerio.Cheerio | null {
  if (iconAttrs.icon === undefined || iconAttrs.icon.length === 0) {
    return null;
  }

  let spanContent;
  const {
    isEmoji,
    unicodeEmoji,
  } = classifyIcon(iconAttrs.icon!);
  if (isEmoji) {
    spanContent = `<span aria-hidden="true">${unicodeEmoji}</span>`;
  } else {
    spanContent = processIconString(iconAttrs.icon);
  }

  let spanNode;
  if (spanContent === null && iconAttrs.icon !== undefined) {
    const img = cheerio(`<img src='${iconAttrs.icon}' alt='Icon'>`)
      .css({ width: iconAttrs.width, height: iconAttrs.height, display: 'inline-block' })
      .addClass(iconAttrs.iconClassName || '');
    img.append('\u200B');

    spanContent = cheerio('<span></span>').append(img).css({
      'padding-bottom': '0.3em',
      'padding-top': '0.3em',
    });
    spanNode = cheerio(spanContent).css({ 'font-size': 'unset', 'min-width': '16px' });
  } else {
    spanNode = cheerio(spanContent).css({ 'font-size': 'unset', 'min-width': '16px' });
    spanNode = spanNode.css({ 'font-size': iconAttrs.iconSize }).addClass(iconAttrs.iconClassName || '');
  }
  // Add invisible character to avoid the element from being empty
  spanNode.append('\u200B');
  const iconSpacing = iconAttrs.text ? '0.35em' : iconAttrs.spacing || '0.35em';
  return spanNode.css({
    'line-height': 'unset',
    'margin-inline-end': iconSpacing,
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

// If an item has a specified icon, that icon and its attributes will be saved and used
// for it and for subsequent items at that level to prevent duplication of icons
// attribute declarations.
// If once is true, its icons and/or attributes will only be used for that item.
// Items with once icons/attributes do not overwrite the previously saved icon/
// attributes, meaning that subsequent items will still use the last saved
// icon/attributes.
const getIconAttributes = (node: MbNode, renderMdInline: (text: string) => string,
                           iconAttrsSoFar?: IconAttributes):
IconAttributes | null => {
  if (iconAttrsSoFar?.icon === undefined && node.attribs.icon === undefined
      && iconAttrsSoFar?.text === undefined && node.attribs.text === undefined) {
    return null;
  }

  return {
    icon: node.attribs.icon !== undefined ? node.attribs.icon : iconAttrsSoFar?.icon,
    width: node.attribs['i-width'] !== undefined ? node.attribs['i-width'] : iconAttrsSoFar?.width,
    height: node.attribs['i-height'] !== undefined ? node.attribs['i-height'] : iconAttrsSoFar?.height,
    iconSize: node.attribs['i-size'] !== undefined ? node.attribs['i-size'] : iconAttrsSoFar?.iconSize,
    iconClassName: node.attribs['i-class'] !== undefined
      ? node.attribs['i-class']
      : iconAttrsSoFar?.iconClassName,
    text: node.attribs.text !== undefined ? renderMdInline(node.attribs.text) : iconAttrsSoFar?.text,
    textClassName: node.attribs['t-class'] !== undefined
      ? node.attribs['t-class']
      : iconAttrsSoFar?.textClassName,
    textSize: node.attribs['t-size'] !== undefined ? node.attribs['t-size'] : iconAttrsSoFar?.textSize,
    spacing: node.attribs['i-spacing'] !== undefined ? node.attribs['i-spacing'] : iconAttrsSoFar?.spacing,
    once: (node.attribs.once === true || node.attribs.once === 'true'),
  };
};

const deleteAttributes = (node: MbNode, attributes: string[]) => {
  attributes.forEach((attr) => {
    delete node.attribs[attr];
  });
};

function updateLi(node: MbNode, iconAttributes: IconAttributes, renderMdInline: (text: string) => string) {
  const curLiIcon = getIconAttributes(node, renderMdInline, iconAttributes);

  deleteAttributes(node, ICON_ATTRIBUTES);

  // Create a new div and span
  const div = cheerio('<div></div>');
  const iconSpan = createIconSpan(curLiIcon!);
  const textSpan = createTextSpan(curLiIcon!);

  div.append(cheerio(node.children).remove());

  // Append iconSpan and div to the child
  if (iconSpan !== null) {
    cheerio(node).append(iconSpan);
  }
  if (textSpan !== null) {
    cheerio(node).append(textSpan);
  }
  cheerio(node).append(div);

  cheerio(node).css({
    display: 'flex',
  });
}

// This function ensures the first item at that level must also be customized.
// If not, the list will be invalidated and default bullets will be used.
// This is to prevent unintentional mixing of standard and customized lists.
// See https://github.com/MarkBind/markbind/pull/2316#discussion_r1255364486 for more details.
function handleLiNode(node: MbNode, iconAttrValue: IconAttributeDetail,
                      renderMdInline: (text: string) => string) {
  const textManager = iconAttrValue.textsManager;
  if (node.attribs.texts) {
    const texts = node.attribs.texts.replace(/(?<!\\)'/g, '"').replace(/\\'/g, '\'');
    try {
      const parsed = JSON.parse(texts);
      if (!Array.isArray(parsed)) {
        throw new Error('Texts attribute must be an array');
      }
      const parsedStringArray = parsed.map((obj: any) => obj.toString());
      textManager.resetTexts(parsedStringArray);
    } catch (e) {
      logger.error(`Error parsing texts: ${texts}, please check the format of the texts attribute\n`);
    }
  }
  if (textManager.isInUse()) {
    if (!node.attribs.text) {
      node.attribs.text = textManager.next();
    } else if (!node.attribs.once || node.attribs.once !== 'true') {
      textManager.stopUsage();
    }
  }
  if (iconAttrValue.isFirst) {
    const nodeIconAttrs = getIconAttributes(node, renderMdInline);
    // Check if first item is customized with icon or text
    if (nodeIconAttrs?.icon !== undefined || nodeIconAttrs?.text !== undefined) {
      iconAttrValue.addIcons = true;
    }
    // Save if the icon is not once
    if (!nodeIconAttrs?.once) {
      iconAttrValue.iconAttrs = nodeIconAttrs;
    }
    iconAttrValue.isFirst = false;
  } else if (iconAttrValue.iconAttrs) {
    const nodeIconAttrs = getIconAttributes(node, renderMdInline, iconAttrValue.iconAttrs);
    // Save if there is icon or text, and not once
    if ((nodeIconAttrs?.icon !== undefined || nodeIconAttrs?.text !== undefined) && !nodeIconAttrs?.once) {
      iconAttrValue.iconAttrs = nodeIconAttrs;
    }
  }
  if (!iconAttrValue.addIcons) {
    return;
  }
  // for subsequent items, if first item is once, there is no previous icon
  // so future attributes that are not once will need to be saved
  if (iconAttrValue.iconAttrs?.icon === undefined && iconAttrValue.iconAttrs?.text === undefined) {
    // There is no previous icon and no previous text
    const nodeIconAttrs = getIconAttributes(node, renderMdInline);
    // Save if current item has icon or text, and it is not once
    if ((nodeIconAttrs?.icon !== undefined || nodeIconAttrs?.text !== undefined) && !nodeIconAttrs?.once) {
      iconAttrValue.iconAttrs = nodeIconAttrs;
    }
  }

  // update only if current item has icon/text or previous items have saved icon/text
  const nodeIconAttrs = getIconAttributes(node, renderMdInline);
  if (nodeIconAttrs?.icon !== undefined || iconAttrValue.iconAttrs?.icon !== undefined
    || nodeIconAttrs?.text !== undefined || iconAttrValue.iconAttrs?.text !== undefined) {
    updateLi(node, iconAttrValue.iconAttrs ?? {}, renderMdInline);
  }
}

export function processUlNode(node: NodeOrText, renderMdInline: (text: string) => string) {
  const nodeAsMbNode = node as MbNode;
  if (nodeAsMbNode.attribs.isIconListProcessed === 'true') {
    delete nodeAsMbNode.attribs.isIconListProcessed;
    return;
  }

  const iconAttrs: IconAttributeDetail[] = [];
  function dfs(currentNode: NodeOrText, level: number) {
    if (!iconAttrs[level]) {
      iconAttrs[level] = {
        isFirst: true, addIcons: false, iconAttrs: null, textsManager: new TextsManager(),
      };
    }

    const ulNode = currentNode as MbNode;
    const liNodes = ulNode.children.filter(child => child.name === 'li');

    liNodes.forEach((liNode) => {
      const ulChildren = liNode.children?.filter(child => child.name === 'ul');
      handleLiNode(liNode as MbNode, iconAttrs[level], renderMdInline);

      ulChildren?.forEach((ulChildNode) => {
        // Traverse the children if any
        dfs(ulChildNode, level + 1);

        // Insert an `isIconListProcessed` flag attribute to the node.
        if (ulChildNode.attribs) {
          ulChildNode.attribs.isIconListProcessed = 'true';
        }
      });
    });
    if (iconAttrs[level].addIcons) {
      updateNodeStyle(ulNode);
    }
  }
  dfs(node, 0);
}
