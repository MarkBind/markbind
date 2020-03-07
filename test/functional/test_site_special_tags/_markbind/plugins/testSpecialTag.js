const cheerio = module.parent.require('cheerio');

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

  return $.html();
}


module.exports = {
  preRender,
  getSpecialTags: () => ['testtag'],
};
