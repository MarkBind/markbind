// import the necessary packages
const octicons = require('@primer/octicons');
const cheerio = require('cheerio');
const markdownItRegExp = require('markdown-it-regexp');

// regular expression to match the icon patterns
const ICON_REGEXP
  = /:(fa[brs]|fa-brands|fa-solid|glyphicon|octicon|octiconlight|mi[forst])-([a-z-]+)~?([a-z-]+)?:/;

// function to get the octicon icons
function getOcticonIcon(iconName: string) {
  return octicons[iconName] ?? null;
}

// handler function for glyphicon icons
const handleGlyphicon = (iconFontName: string) =>
  `<span aria-hidden="true" class="glyphicon glyphicon-${iconFontName}"></span>`;

// handler function for octicon icons
const handleOcticon = (iconFontName: string, iconClass?: string) => {
  const octiconIcon = getOcticonIcon(iconFontName);
  // ensure octicons are valid
  if (octiconIcon === null) {
    return '<span aria-hidden="true"></span>';
  }
  return iconClass ? octiconIcon.toSVG({ class: iconClass }) : octiconIcon.toSVG();
};

// handler function for light octicon icons
const handleOcticonLight = (iconFontName: string, iconClass?: string) => {
  const octiconIcon = getOcticonIcon(iconFontName);
  // ensure octicons are valid
  if (octiconIcon === null) {
    return '<span aria-hidden="true"></span>';
  }
  const octiconIconHtml = iconClass ? octiconIcon.toSVG({ class: iconClass }) : octiconIcon.toSVG();
  const $ = cheerio.load(octiconIconHtml);
  $('svg').attr('style', 'color: #fff');
  return $.html();
};

// handler function for material icons
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
  // .material-icons generates 'Filled' style icons; hence, no suffix is needed for 'mif'.
  }
  // Use .align-middle by default to vertically-align the icon with its surrounding text (if any).
  // Also, replace dashes (-) with underscores (_) to format the icon name properly.
  return `<span aria-hidden="true" class="${materialIconsClass} align-middle">`
    + `${iconFontName.split('-').join('_')}</span>`;
};

// handler function for font awesome icons
const handleFontAwesome = (iconFontType: string, iconFontName: string) =>
  `<span aria-hidden="true" class="${iconFontType} fa-${iconFontName}"></span>`;

// function to get the respective icon html based on the icon font type
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

// function to process the icon string and get the icon html
const processIconString = (iconStr: string) => {
  let icon = iconStr;

  if (!iconStr.startsWith(':') && !iconStr.endsWith(':')) {
    icon = `:${iconStr}:`;
  }

  const match = icon.match(ICON_REGEXP);
  return match ? getIconHtml(match) : null;
};

// create a markdown-it plugin to process the icon strings in the markdown
const markdownItPlugin = markdownItRegExp(
  ICON_REGEXP,
  (match: string[]) => getIconHtml(match),
);

module.exports = {
  markdownItPlugin,
  processIconString,
};
