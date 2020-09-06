module.exports = {
  'extends': [
    '../../.eslintrc.js',
    'plugin:vue/recommended',
  ],
  'globals': {
    'jQuery': 'readonly',
    'Vue': 'readonly',
    'baseUrl': 'readonly',
  },
  'rules': {
    'quote-props': 'off',
    'vue/html-self-closing': [
      'error',
      {
        'html': {
          'void': 'always',
          'normal': 'never',
        },
      },
    ],
    'vue/max-attributes-per-line': ['error', { 'singleline': 2 }],
    'vue/order-in-components': 'off',
  },
};
