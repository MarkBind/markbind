const octicons = require('@primer/octicons');

module.exports = require('markdown-it-regexp')(
    /:(fa[brs]|glyphicon|octicon)-([a-z-]+):([0-9])x/,
    (match, utils) => {
        let iconFontType = match[1];
        let iconFontName = match[2];
        let iconSize = match[3];
        const octiconSizeOptions = {height: 16, width: 12};

        if (iconFontType === 'glyphicon') {
            return `<span aria-hidden="true" class="glyphicon glyphicon-${iconFontName}"></span>`;
        } else if (iconFontType === 'octicon') {
            const sizeInNum = parseInt(iconSize, 10);
            octiconSizeOptions.height *= sizeInNum;
            octiconSizeOptions.width *= sizeInNum;
            return octicons[iconFontName].toSVG(octiconSizeOptions);
        } else { // If icon is a Font Awesome icon
            return `<span aria-hidden="true" class="${iconFontType} fa-${iconFontName}"></span>`;
        }
    }
);
