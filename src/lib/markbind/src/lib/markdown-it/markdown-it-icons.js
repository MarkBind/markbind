module.exports = require('markdown-it-regexp')(
    /:(fa[brs]|glyphicon)-([a-z-]+):/m,
    (match, utils) => {
        let iconFontType = match[1];
        let iconFontName = match[2];

        if (iconFontType === 'glyphicon') {
            return `<span aria-hidden="true" class="glyphicon glyphicon-${iconFontName}"></span>`;
        } else { // If icon is a Font Awesome icon
            return `<span aria-hidden="true" class="${iconFontType} fa-${iconFontName}"></span>`;
        }
    }
);
