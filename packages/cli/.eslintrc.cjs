module.exports = {
  extends: ['../../.eslintrc.js'],
  overrides: [
    {
      files: ['./**/*.ts'],
      rules: {
        // Override airbnb import/extensions rule to require extension for non-package import
        // ESM relative imports require file extensions: https://nodejs.org/api/esm.html#esm_import_specifiers
        // This conflicts with the airbnb lint rule:
        // https://github.com/airbnb/javascript?tab=readme-ov-file#modules--import-extensions
        // Additional discussion on the issue: https://github.com/airbnb/javascript/issues/2030
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'always',
            ts: 'always',
            mjs: 'always',
          },
        ],
        // Override lodash import-scope rule to turn it off and allow full import
        // lodash currently does not have a mechanism to use its optimized imports
        // along with type definitions: https://github.com/lodash/lodash/issues/3192
        // Additional discussion here: https://github.com/MarkBind/markbind/issues/2615
        'lodash/import-scope': 0,
      },
    },
    // Rule overrides for TypeScript files within functional test folder
    // The functional test folder doesn't conform to naming standard of test files,
    // so eslint doesn't detect that dependencies within those files should be dev dependencies.
    {
      files: ['test/**/*.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
