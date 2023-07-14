const octicons = require('@primer/octicons');
const cheerio = require('cheerio');
const markdownItRegExp = require('markdown-it-regexp');

const ICON_REGEXP = new RegExp(
  ':(fa[brs]|fa-brands|fa-solid|glyphicon|octicon|octiconlight|mi[forst])-'
  + '([a-z-]+)~?([a-z-]+)?:',
);

function getOcticonIcon(iconName: string) {
  return octicons[iconName] ?? null;
}

const handleGlyphicon = (iconFontName: string) =>
  `<span aria-hidden="true" class="glyphicon glyphicon-${iconFontName}"></span>`;

const handleOcticon = (iconFontName: string, iconClass?: string) => {
  const octiconIcon = getOcticonIcon(iconFontName);
  if (octiconIcon === null) {
    return '<span aria-hidden="true"></span>';
  }
  return iconClass ? octiconIcon.toSVG({ class: iconClass }) : octiconIcon.toSVG();
};

const handleOcticonLight = (iconFontName: string, iconClass?: string) => {
  const octiconIcon = getOcticonIcon(iconFontName);
  if (octiconIcon === null) {
    return '<span aria-hidden="true"></span>';
  }
  const octiconIconHtml = iconClass ? octiconIcon.toSVG({ class: iconClass }) : octiconIcon.toSVG();
  const $ = cheerio.load(octiconIconHtml);
  $('svg').attr('style', 'color: #fff');
  return $.html();
};

const handleMaterialIcon = (iconFontType: string, iconFontName: string) => {
  let materialIconsClass = 'material-icons';
  switch (iconFontType) {
  case 'mio':
    materialIconsClass += '-outlined';
    break;
  case 'mir':
    materialIconsClass += '-round';
    break;
  case 'mis':
    materialIconsClass += '-sharp';
    break;
  case 'mit':
    materialIconsClass += '-two-tone';
    break;
  default:
  }
  return `<span aria-hidden="true" class="${materialIconsClass} align-middle">`
    + `${iconFontName.split('-').join('_')}</span>`;
};

const handleFontAwesome = (iconFontType: string, iconFontName: string) =>
  `<span aria-hidden="true" class="${iconFontType} fa-${iconFontName}"></span>`;

const getIconHtml = (match: string[]) => {
  const iconFontType = match[1];
  const iconFontName = match[2];
  const iconClass = match[3];

  if (iconFontType === 'glyphicon') {
    return handleGlyphicon(iconFontName);
  } else if (iconFontType === 'octicon') {
    return handleOcticon(iconFontName, iconClass);
  } else if (iconFontType === 'octiconlight') {
    return handleOcticonLight(iconFontName, iconClass);
  } else if (iconFontType.startsWith('mi')) {
    return handleMaterialIcon(iconFontType, iconFontName);
  }
  return handleFontAwesome(iconFontType, iconFontName);
};

const processIconString = (iconStr: string) => {
  let icon = iconStr;

  if (!iconStr.startsWith(':') && !iconStr.endsWith(':')) {
    icon = `:${iconStr}:`;
  }

  const match = icon.match(ICON_REGEXP);
  return match ? getIconHtml(match) : null;
};

const markdownItPlugin = markdownItRegExp(
  ICON_REGEXP,
  (match: string[]) => getIconHtml(match),
);

// Attach `getIconHtml` to the exported function
markdownItPlugin.processIconString = processIconString;

// The export remains unchanged
module.exports = markdownItPlugin;
