const octicons = require('@primer/octicons');

module.exports = require('markdown-it-regexp')(
    /:(fa[brs]|glyphicon|octicon)-([a-z-]+)~?([a-z-]+)?:/,
    (match, utils) => {
        let iconFontType = match[1];
        let iconFontName = match[2];
        let iconClass = match[3];

        if (iconFontType === 'glyphicon') {
            return `<span aria-hidden="true" class="glyphicon glyphicon-${iconFontName}"></span>`;
        } else if (iconFontType === 'octicon') {
          if (iconClass) {
            return octicons[iconFontName].toSVG({"class": iconClass});
          } else {
            return octicons[iconFontName].toSVG();
          }
        } else { // If icon is a Font Awesome icon
            return `<span aria-hidden="true" class="${iconFontType} fa-${iconFontName}"></span>`;
        }
    }
);
