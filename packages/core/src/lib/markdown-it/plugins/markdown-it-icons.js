const octicons = require('@primer/octicons');

module.exports = require('markdown-it-regexp')(
  /:(fa[brs]|glyphicon|octicon|octiconlight|mi[forst])-([a-z-]+)~?([a-z-]+)?:/,
  (match) => {
    const iconFontType = match[1];
    const iconFontName = match[2];
    const iconClass = match[3];

    if (iconFontType === 'glyphicon') {
      return `<span aria-hidden="true" class="glyphicon glyphicon-${iconFontName}"></span>`;
    } else if (iconFontType === 'octicon') {
      // ensure octicons are valid
      if (!(iconFontName in octicons)) {
        return '<span aria-hidden="true"></span>';
      }
      return iconClass
        ? octicons[iconFontName].toSVG({ class: iconClass })
        : octicons[iconFontName].toSVG();
    } else if (iconFontType === 'octiconlight') {
      // ensure octicons are valid
      if (!(iconFontName in octicons)) {
        return '<span aria-hidden="true"></span>';
      }
      return iconClass
        ? octicons[iconFontName].toSVG({ style: 'color: #fff;', class: iconClass })
        : octicons[iconFontName].toSVG({ style: 'color: #fff;' });
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
      + `${iconFontName.replace('-', '_')}</span>`;
    } // If icon is a Font Awesome icon
    return `<span aria-hidden="true" class="${iconFontType} fa-${iconFontName}"></span>`;
  },
);
