/* eslint-disable-next-line */
module.exports = {
  'env': {
    'node': false,
    'browser': true,
  },
  'extends': ['../../.eslintrc.js'],
  'globals': {
    'jQuery': 'readonly',
    'Vue': 'readonly',
    'baseUrl': 'readonly',
  },
  'rules': {
    'quote-props': 'off',
  },
};
