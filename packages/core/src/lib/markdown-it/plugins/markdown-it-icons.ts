import octicons, { IconName } from '@primer/octicons';
import cheerio from 'cheerio';

const markdownItRegExp = require('markdown-it-regexp');

function getOcticonIcon(iconName: string) {
  return octicons[iconName as IconName] ?? null;
}

const ICON_REGEXP
  = /:(fa[brs]|fa-brands|fa-solid|glyphicon|octicon|octiconlight|mi[forst])-([a-z-]+)~?([a-z-]+)?:/;

export = markdownItRegExp(
  ICON_REGEXP,
  (match: string[]) => {
    const iconFontType = match[1];
    const iconFontName = match[2];
    const iconClass = match[3];

    if (iconFontType === 'glyphicon') {
      return `<span aria-hidden="true" class="glyphicon glyphicon-${iconFontName}"></span>`;
    } else if (iconFontType === 'octicon') {
      const octiconIcon = getOcticonIcon(iconFontName);
      // ensure octicons are valid
      if (octiconIcon === null) {
        return '<span aria-hidden="true"></span>';
      }
      return iconClass
        ? octiconIcon.toSVG({ class: iconClass })
        : octiconIcon.toSVG();
    } else if (iconFontType === 'octiconlight') {
      const octiconIcon = getOcticonIcon(iconFontName);
      // ensure octicons are valid
      if (octiconIcon === null) {
        return '<span aria-hidden="true"></span>';
      }
      const octiconIconHtml = iconClass
        ? octiconIcon.toSVG({ class: iconClass })
        : octiconIcon.toSVG();
      const $ = cheerio.load(octiconIconHtml);
      $('svg').attr('style', 'color: #fff');
      return $.html();
    } else if (iconFontType.startsWith('mi')) {
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
    } // If icon is a Font Awesome icon
    return `<span aria-hidden="true" class="${iconFontType} fa-${iconFontName}"></span>`;
  },
);
