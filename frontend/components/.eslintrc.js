module.exports = {
  'env': {
    'node': true,
    'es6': true,
    'jest': true,
  },
  'extends': ['airbnb-base', 'plugin:vue/recommended'],
  'rules': {
    'array-bracket-newline': ['error', { 'multiline': true }],
    'func-names': 'off',
    'function-paren-newline': 'off',
    'indent': [
      'error',
      2,
      {
        'CallExpression': { 'arguments': 'first' },
        'FunctionDeclaration': { 'parameters': 'first' },
        'FunctionExpression': { 'parameters': 'first' },
      },
    ],
    'max-len': ['error', { 'code': 110 }],
    'operator-linebreak': ['error', 'before'],
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
