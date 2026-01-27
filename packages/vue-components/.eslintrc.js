module.exports = {
  'extends': [
    '../../.eslintrc.js',
    'plugin:vue/vue3-recommended',
  ],
  'parser': 'vue-eslint-parser',
  'parserOptions': {
    'parser': '@typescript-eslint/parser',
    'project': `${__dirname}/tsconfig.lint.json`,
    'tsconfigRootDir': __dirname,
    'extraFileExtensions': ['.vue'],
  },
  'settings': {
    'import/resolver': {
      'node': {
        'extensions': ['.js', '.ts', '.vue'],
      },
    },
  },
  'globals': {
    'Vue': 'readonly',
  },
  'overrides': [
    {
      'files': ['*.js'],
      'parserOptions': {
        'project': null,
      },
    },
  ],
  'rules': {
    'quote-props': 'off',
    'import/no-default-export': 'off', // Vue components and mixins use default exports
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        'js': 'never',
        'ts': 'never',
        'vue': 'always',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        'devDependencies': true, // Allow importing Vue and other devDependencies
      },
    ],
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
};
