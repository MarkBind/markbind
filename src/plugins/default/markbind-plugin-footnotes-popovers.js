const cheerio = module.parent.require('cheerio');

module.exports = {
  postRender: (content) => {
    const $ = cheerio.load(content, { xmlMode: false });
    let popoversHtml = '';
    $('li.footnote-item').each((index, li) => {
      const id = `pop:footnote${index + 1}`;
      popoversHtml += `
        <popover id="${id}">
          <div slot="content">
            ${$(li).html()}
          </div>
        </popover>
      `;
    });
    $('#content-wrapper')
      .append($('hr.footnotes-sep'))
      .append($('section.footnotes').append(popoversHtml));
    return $.html();
  },
};
