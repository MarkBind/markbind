import octicons, { IconName as OctName } from '@primer/octicons';
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

function createIconSpan(
  iconAttrs: IconAttributes,
): cheerio.Cheerio {
  const {
    isEmoji,
    isImage,
    unicodeEmoji,
  } = classifyIcon(iconAttrs.icon!);

  let span = '<span></span>';
  let spanNode = cheerio(span);
  if (isEmoji) {
    span = `<span aria-hidden="true">${unicodeEmoji}</span>`;
    spanNode = cheerio(span);
    spanNode.css({ 'font-size': iconAttrs.size });
  } else if (isImage) {
    span = `<img src="${iconAttrs.icon}" alt="Icon">`;
    spanNode = cheerio(span);
    spanNode.css({ 'width': iconAttrs.width, 'height': iconAttrs.height, 'padding': '0.3em' });
  }
  else {
    span = processIconString(iconAttrs.icon);
    spanNode = cheerio(span);
    spanNode.css({ 'font-size': iconAttrs.size });
  }
  spanNode.addClass(iconAttrs.className!);


  return spanNode.css({
    'line-height': 'unset',
    'margin-inline-end': '0.3em',
    'height': '100%',
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

function updateLiChildren(child: NodeOrText, defaultLiIconAttributes: IconAttributes) {
  const childNode = child as MbNode

  let curLiIcon: IconAttributes = {
    icon: childNode.attribs.icon,
    width: childNode.attribs.width,
    height: childNode.attribs.height,
    size: childNode.attribs.size,
    className: childNode.attribs.class,
  };

  curLiIcon = curLiIcon.icon ? curLiIcon : defaultLiIconAttributes;

  delete childNode.attribs.icon;
  delete childNode.attribs.size;
  delete childNode.attribs.width;
  delete childNode.attribs.height;
  delete childNode.attribs.class;

  let children = cheerio(child.children);

  // Create a new div and span
  let div = cheerio('<div></div>');
  let iconSpan = createIconSpan(curLiIcon);

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
    'display': 'flex',
  });

}



export function processUlNode(node: NodeOrText): NodeOrText {
  if (!('name' in node && node.name === 'ul') && !node.children) {
    return node;
  }
  const ulNode = node as MbNode;

  let defaultLi;
  let isFirst = true;
  let defaultIcon: IconAttributes = {};
  const curUlIcon: IconAttributes = {
    icon: ulNode.attribs.icon,
    width: ulNode.attribs.width,
    height: ulNode.attribs.height,
    size: ulNode.attribs.size,
    className: ulNode.attribs.class,
  };


  delete ulNode.attribs.icon;
  delete ulNode.attribs.size;
  delete ulNode.attribs.width;
  delete ulNode.attribs.height;
  delete ulNode.attribs.class;

  if (curUlIcon.icon) {
    defaultIcon = curUlIcon;
  }

  for (let i = 0; i < ulNode.children.length; i += 1) {

    if (ulNode.children[i].name !== 'li') {
      continue;
    }

    defaultLi = ulNode.children[i] as MbNode;
    let curLiIcon: IconAttributes = {
      icon: defaultLi.attribs.icon,
      width: defaultLi.attribs.width,
      height: defaultLi.attribs.height,
      size: defaultLi.attribs.size,
      className: defaultLi.attribs.class,
    };

    if (isFirst) {
      if (!curLiIcon.icon && !defaultIcon.icon) {
        return ulNode;
      }
      isFirst = false;
      updateNodeStyle(ulNode);
      defaultIcon = curLiIcon.icon ? curLiIcon : defaultIcon;
    } 

    defaultIcon = curLiIcon.icon ? curLiIcon : defaultIcon;

    updateLiChildren(ulNode.children[i], defaultIcon);
  }

  //TODO activate waterfall for nested levels

  return ulNode;
}
