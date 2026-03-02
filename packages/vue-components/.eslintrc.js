module.exports = {
  'extends': [
    '../../.eslintrc.js',
    'plugin:vue/vue3-recommended',
  ],
  'globals': {
    'Vue': 'readonly',
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
    'vue/multi-word-component-names': 'off',
  },
  'overrides': [
    {
      'files': '**/*.ts',
      'parser': '@typescript-eslint/parser',
      'rules': {
        // vue-components uses default exports for single-function utility modules,
        // consumed by .vue files via default imports
        'import/no-default-export': 'off',
      },
    },
  ],
};
