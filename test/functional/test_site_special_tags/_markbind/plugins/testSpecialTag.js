const cheerio = module.parent.require('cheerio');

const ESCAPE_REGEX = new RegExp('{% *raw *%}(.*?){% *endraw *%}', 'gs');

function removeEscapeTags(_, p1) {
  return p1;
}

/*
 Simple test plugin that whitelists <testtag> as a special tag.
 If encountered, it wraps the text node inside with some indication text as to
 where the special tag's text begins and ends '!success\n...\nsuccess!',
 as parsed by htmlparser2 ( but not necessarily markdown-it ).
 */

function preRender(content) {
  const $ = cheerio.load(content);
  const testElements = $('testtag');
  testElements.each((index, testElement) => {
    const unwrappedText = $(testElement).text();
    const wrappedText = `!success\n${unwrappedText}\nsuccess!`;

    $(testElement).text(wrappedText);
  });

  const escapedNunjucks = $('mustache');
  escapedNunjucks.each((index, element) => {
    const unwrappedText = $(element).text();
    const unescapedText = unwrappedText.replace(ESCAPE_REGEX, removeEscapeTags);
    const transformedText = unescapedText.replace(/{/g, '!success').replace(/}/g, 'success!');
    $(element).text(transformedText);
  });


  return $.html();
}


module.exports = {
  preRender,
  getSpecialTags: () => ['testtag', 'mustache'],
};
