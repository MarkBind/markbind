import octicons, { IconName as OctName } from '@primer/octicons';
import { NodeOrText } from '../utils/node';

const { processIconString } = require('../lib/markdown-it/plugins/markdown-it-icons');
const emojiDictionary = require('../lib/markdown-it/patches/markdown-it-emoji-fixed');

interface EmojiData {
  [key: string]: string;
}

const emojiData = emojiDictionary as unknown as EmojiData;

interface IconAttributes {
  icon?: string;
  className?: string;
  width?: string;
  height?: string;
}

type Size = {
  fontSize: string;
  width: string;
  height: string;
};

function updateNodeRelations(iChild: NodeOrText, divChild: NodeOrText, children: NodeOrText[]): void {
  iChild.next = divChild;
  divChild.prev = iChild;

  children.forEach((child) => {
    child.parent = divChild;
  });
}

function getStyleObject(node: NodeOrText): { [key: string]: string } {
  let styleObject: { [key: string]: string } = {};
  if (node.attribs?.style) {
    const { style } = node.attribs;
    styleObject = style.split(';').reduce((acc: Record<string, string>, rule: string) => {
      const [property, value] = rule.split(':').map((str: string) => str.trim());
      if (property) acc[property] = value;
      return acc;
    }, {});
  }
  return styleObject;
}

function createStyleString(styleObject: { [key: string]: string }): string {
  return Object.entries(styleObject).map(
    ([property, value]: [string, string]) => `${property}: ${value}`).join('; ');
}
function classifyIcon(icon: string) {
  console.log('classifyIcon: ', processIconString(icon));
  const isEmoji = Object.prototype.hasOwnProperty.call(emojiData, icon);
  const localFileRegex = /^(\.\/)?[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+\.(jpg|png|gif|bmp|svg|jpeg)$/;
  const urlRegex = /^(http(s)?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  const isImage = !isEmoji && (localFileRegex.test(icon) || urlRegex.test(icon));

  let iconClass;
  let iconName;
  let isOcticon = false;
  let octiconColor;
  let octiconClass;
  if (!isEmoji && !isImage) {
    const materialIconsRegex = /^(mif|mio|mir|mis|mit)-(.*)/;
    const octiconRegex = /^(octiconlight-octicon-|octicon-)([a-z-]+)(~[\w-]+)?/;
    const materialIconsMatch = icon.match(materialIconsRegex);
    const octiconMatch = icon.match(octiconRegex);
    if (materialIconsMatch) {
      const [, prefix, name] = materialIconsMatch;
      switch (prefix) {
      case 'mif':
        iconClass = 'material-icons align-middle';
        break;
      case 'mio':
        iconClass = 'material-icons-outlined align-middle';
        break;
      case 'mir':
        iconClass = 'material-icons-round align-middle';
        break;
      case 'mis':
        iconClass = 'material-icons-sharp align-middle';
        break;
      case 'mit':
        iconClass = 'material-icons-two-tone align-middle';
        break;
      default:
        iconClass = 'material-icons align-middle';
      }
      iconName = name.replace(/-/g, '_');
    } else if (octiconMatch) {
      const [, prefix, name, classMatch] = octiconMatch;
      isOcticon = true;
      iconName = name;
      octiconClass = classMatch ? classMatch.slice(1) : undefined;
      octiconColor = prefix === 'octiconlight-octicon-' ? '#fff' : undefined;
    } else {
      const prefixRegex = /^(fas-|far-|fab-|glyphicon-)/;
      if (prefixRegex.test(icon)) {
        iconClass = icon.replace(prefixRegex, (match, p1) => {
          switch (p1) {
          case 'glyphicon-':
            return `glyphicon ${match}`;
          default:
            return `${p1.slice(0, -1)} `;
          }
        });
      } else {
        // if the icon does not match any category, return it as it is
        iconClass = icon;
      }
    }
  }

  return {
    isEmoji,
    isImage,
    unicodeEmoji: isEmoji
      ? emojiData[icon]
      : undefined,
    iconClass,
    iconName,
    isOcticon,
    octiconColor,
    octiconClass,
  };
}

function getOcticonIcon(iconName: string) {
  return octicons[iconName as OctName] ?? null;
}

function createIChild(
  parent: NodeOrText,
  iIcon: string,
  size: Size,
  className?: string,
): NodeOrText {
  const {
    isEmoji,
    isImage,
    unicodeEmoji,
    iconClass,
    iconName,
    isOcticon,
    octiconColor,
    octiconClass,
  } = classifyIcon(iIcon);
  const icon = iconClass || iIcon;

  let child: NodeOrText;
  const defaultSize = `width: ${size.width}; height: ${size.height}; 
          margin-right:5px;text-align:center;display:
          flex;align-items:center;justify-content:center;flex-shrink:0;`;

  if (isEmoji) {
    child = {
      type: 'tag',
      name: 'span',
      attribs: {
        ...className && { class: className },
        'aria-hidden': 'true',
        style: `${defaultSize}${size.fontSize ? `font-size:${size.fontSize};
        margin-right: 5px;` : 'margin-right: 5px;'}`,
      },
      children: [
        {
          type: 'text',
          data: unicodeEmoji,
        },
      ],
      next: undefined,
      prev: undefined,
      parent,
    };
  } else if (isImage) {
    const altText = icon.split('/').pop()?.split('.')[0] || '';
    const divNode: NodeOrText = {
      type: 'tag',
      name: 'div',
      attribs: {
        style: 'padding: 0.2rem;',
      },
      children: [],
      next: undefined,
      prev: undefined,
      parent,
    };

    const imgNode: NodeOrText = {
      type: 'tag',
      name: 'img',
      attribs: {
        ...className && { class: className },
        src: icon,
        alt: altText,
        style: defaultSize,
      },
      children: [],
      next: undefined,
      prev: undefined,
      parent: divNode,
    };
    divNode.children?.push(imgNode);
    child = divNode;
  } else if (isOcticon) {
    const octiconIcon = getOcticonIcon(iconName!);
    let svgStr = octiconIcon.toSVG({
      class: octiconClass ? `${iconClass} ${octiconClass} ${className}` : `${iconClass} ${className}`,
    });

    if (octiconColor) {
      svgStr = svgStr.replace('<path', `<path fill="${octiconColor}"`);
    }
    child = {
      type: 'tag',
      name: 'span',
      attribs: {
        'aria-hidden': 'true',
        style: `${defaultSize}margin-right:5px;${size.fontSize ? `font-size:${size.fontSize};` : ''}`,
      },
      children: [
        {
          type: 'text',
          data: svgStr,
        },
      ],
      next: undefined,
      prev: undefined,
      parent,
    };
  } else {
    child = {
      type: 'tag',
      name: 'span',
      attribs: {
        class: className ? `${icon} ${className}` : icon,
        'aria-hidden': 'true',
        style: `${defaultSize}margin-right:5px;${size.fontSize ? `font-size:${size.fontSize};` : ''}`,
      },
      children: iconName ? [
        {
          type: 'text',
          data: iconName,
        },
      ] : [],
      next: undefined,
      prev: undefined,
      parent,
    };
  }
  return child;
}

function getSize(widthPar: string, heightPar: string) {
  const width = widthPar || heightPar || '25px';
  const height = heightPar || widthPar || '25px';
  const sizeUnitRegexp = /(\d+)(px|em|rem|%|vw|vh|vmin|vmax|ex|ch)/;
  const widthMatch = width.match(sizeUnitRegexp);
  const heightMatch = height.match(sizeUnitRegexp);

  if (!widthMatch || !heightMatch) {
    throw new Error(`Invalid width or height format. 
                    Expected format is number followed by unit
                    (px | em | rem |%| vw | vh | vmin | vmax | ex | ch).`);
  }

  // Ensure both width and height are using the same unit
  if (widthMatch[2] !== heightMatch[2]) {
    throw new Error('The units of width and height should be the same.');
  }

  let fontSize = Math.min(parseFloat(widthMatch[1]), parseFloat(heightMatch[1]));

  // Assuming the single character font will take up approximately 70% of the container's smaller dimension
  fontSize *= 0.7;

  return {
    fontSize: `${fontSize}${widthMatch[2]}`, // fontSize in the same unit as width and height
    width,
    height,
  };
}

function createDivChild(parent: NodeOrText, children: NodeOrText[]): NodeOrText {
  return {
    type: 'tag',
    name: 'div',
    attribs: {},
    children,
    next: undefined,
    prev: undefined,
    parent,
  };
}

function updateNodeStyle(node: NodeOrText) {
  const styleObject = getStyleObject(node);
  styleObject['list-style-type'] = 'none';
  styleObject['padding-left'] = '0';
  if (!node.attribs) node.attribs = {};

  node.attribs.style = createStyleString(styleObject);
}

function updateLiChildren(child: NodeOrText, defaultLiIconAttributes: IconAttributes) {
  const icon = child.attribs?.icon || defaultLiIconAttributes.icon;
  const width = child.attribs?.width || defaultLiIconAttributes.width;
  const height = child.attribs?.height || defaultLiIconAttributes.height;
  const className = child.attribs?.class || defaultLiIconAttributes.className;

  if (child.attribs?.icon) delete child.attribs.icon;
  if (child.attribs?.size) delete child.attribs.size;
  if (child.attribs?.class) delete child.attribs.class;

  const size = getSize(width, height);

  const iChild: NodeOrText = createIChild(child, icon, size, className);
  const divChild: NodeOrText = createDivChild(child, child.children || []);
  child.children = [iChild, divChild];
  updateNodeRelations(iChild, divChild, child.children || []);
  if (!child.attribs) child.attribs = {};
  child.attribs.style = 'display:flex;';
}

export function processUlNode(node: NodeOrText): NodeOrText {
  if ('name' in node && node.name === 'ul') {
    let defaultLi;
    let isFirst = true;
    // Ensure that node.children is defined before iterating
    if (node.children) {
      // Iterate over node.children to find the first li
      let defaultLiIcon: IconAttributes = {};

      for (let i = 0; i < node.children.length; i += 1) {
        if (node.children[i].name === 'li') {
          defaultLi = node.children[i];
          let curLiIcon: IconAttributes = {};
          curLiIcon = {
            icon: defaultLi.attribs?.icon,
            width: defaultLi.attribs?.width,
            height: defaultLi.attribs?.height,
            className: defaultLi.attribs?.class,
          };

          if (isFirst) {
            if (!curLiIcon.icon || curLiIcon.icon === undefined) {
              return node;
            }
            isFirst = false;
            updateNodeStyle(node);
            defaultLiIcon = curLiIcon;
          } else if (curLiIcon.icon) {
            defaultLiIcon = curLiIcon;
          }
          updateLiChildren(node.children[i], defaultLiIcon);
        }
      }
    }
  }
  return node;
}
