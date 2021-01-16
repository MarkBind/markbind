const nunjucks = require('nunjucks');
const path = require('path');
const { SetExternalExtension } = require('../../../../src/lib/nunjucks-extensions/set-external');

test('does not render the header row when noHeader is not set', () => {
  const nj = nunjucks.configure();
  const setExternalExtension = new SetExternalExtension(path.resolve(__dirname, '../../../../'), nj);
  nj.addExtension('SetExternalExtension', setExternalExtension);
  const withHeaderCsvPath = 'test/unit/lib/nunjucks-extensions/data-with-header.csv';

  // eslint-disable-next-line max-len
  const template = `{% ext x = "${withHeaderCsvPath}"%}{% for item in x %}<div>{{ item.name }}{{ item.score }}</div>{% endfor %}`;
  const actual = nj.renderString(template);
  const expected = '<div>Alice1</div><div>Bob2</div>';
  expect(actual).toEqual(expected);
});

test('renders the header row when noHeader is set', () => {
  const nj = nunjucks.configure();
  const setExternalExtension = new SetExternalExtension(path.resolve(__dirname, '../../../../'), nj);
  nj.addExtension('SetExternalExtension', setExternalExtension);
  const noHeaderCsvPath = 'test/unit/lib/nunjucks-extensions/data-with-no-header.csv';

  // eslint-disable-next-line max-len
  const template = `{% ext x = "${noHeaderCsvPath}", noHeader %}{% for item in x %}<div>{{ item[0] }}{{ item[1] }}</div>{% endfor %}`;
  const actual = nj.renderString(template);
  const expected = '<div>1Alice</div><div>2Bob</div><div>3Charlie</div>';
  expect(actual).toEqual(expected);
});

test('can index by [rowNum][colNum] when noHeader is set', () => {
  const nj = nunjucks.configure();
  const setExternalExtension = new SetExternalExtension(path.resolve(__dirname, '../../../../'), nj);
  nj.addExtension('SetExternalExtension', setExternalExtension);
  const noHeaderCsvPath = 'test/unit/lib/nunjucks-extensions/data-with-no-header-indexing.csv';

  // eslint-disable-next-line max-len
  const template = `{% ext x = "${noHeaderCsvPath}", noHeader %}<div>{{ x[0][0] }}{{ x[0][1] }}{{ x[0][2] }}{{ x[1][0] }}{{ x[1][1] }}{{ x[2][0] }}</div>`;
  const actual = nj.renderString(template);
  const expected = '<div>123456</div>';
  expect(actual).toEqual(expected);
});
