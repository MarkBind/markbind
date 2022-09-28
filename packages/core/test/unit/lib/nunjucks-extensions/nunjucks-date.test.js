const { filter } = require('../../../../src/lib/nunjucks-extensions/nunjucks-date');

test('without format and days to add', () => {
  const actual = filter('2020-01-01');
  const expected = 'Wed 1 Jan';
  expect(actual).toEqual(expected);
});

test('without days to add', () => {
  const actual = filter('2020-01-01', 'ddd D MMM');
  const expected = 'Wed 1 Jan';
  expect(actual).toEqual(expected);
});

test('YYYY MMMM DD format', () => {
  const actual = filter('2020-01-01', 'YYYY MMMM DD');
  const expected = '2020 January 01';
  expect(actual).toEqual(expected);
});

test('ddd Do MMM format', () => {
  const actual = filter('2020-01-01', 'ddd Do MMM');
  const expected = 'Wed 1st Jan';
  expect(actual).toEqual(expected);
});

test('adding 1 day', () => {
  const actual = filter('2020-01-01', 'ddd D MMM', 1);
  const expected = 'Thu 2 Jan';
  expect(actual).toEqual(expected);
});

test('adding 10 days', () => {
  const actual = filter('2020-01-01', 'ddd D MMM', 10);
  const expected = 'Sat 11 Jan';
  expect(actual).toEqual(expected);
});

test('adding -1 day', () => {
  const actual = filter('2020-01-01', 'ddd D MMM', -1);
  const expected = 'Tue 31 Dec';
  expect(actual).toEqual(expected);
});

test('format and adding 2 days', () => {
  const actual = filter('2020-01-01', 'ddd Do MMM', 2);
  const expected = 'Fri 3rd Jan';
  expect(actual).toEqual(expected);
});
