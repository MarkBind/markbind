/* eslint quote-props: ["error", "always"] */
/* eslint quotes: ["error", "double"] */

module.exports = {
  "env": {
    "node": true,
    "es6": true,
    "jest": true,
  },
  "plugins": ["lodash"],
  "extends": ["airbnb-base", "plugin:lodash/recommended"],
  "rules": {
    "array-bracket-newline": ["error", { "multiline": true }],
    "func-names": "off",
    "function-paren-newline": "off",
    "indent": [
      "error",
      2,
      {
        "CallExpression": { "arguments": "first" },
        "FunctionDeclaration": { "parameters": "first" },
        "FunctionExpression": { "parameters": "first" },
      },
    ],
    "lodash/prefer-lodash-method": [0],
    "lodash/prefer-noop": [0],
    "max-len": ["error", { "code": 110 }],
    "operator-linebreak": ["error", "before"],
    // override airbnb-base dev dependencies, latest version does not white list __mocks__
    "import/no-extraneous-dependencies": [
      "error", {
        "devDependencies": [
          "test/**", // tape, common npm pattern
          "tests/**", // also common npm pattern
          "spec/**", // mocha, rspec-like pattern
          "**/__tests__/**", // jest pattern
          "**/__mocks__/**", // jest pattern
          "test.{js,jsx}", // repos with a single test file
          "test-*.{js,jsx}", // repos with multiple top-level test files
          "**/*.{test,spec}.{js,jsx}", // tests where the extension denotes that it is a test
          "**/jest.config.js", // jest config
          "**/webpack.config.js", // webpack config
          "**/webpack.config.*.js", // webpack config
          "**/rollup.config.*.js", // rollup config
          "**/rollup.config.*.js", // rollup config
          "**/gulpfile.js", // gulp config
          "**/gulpfile.*.js", // gulp config
          "**/Gruntfile{,.js}", // grunt config
          "**/protractor.conf.js", // protractor config
          "**/protractor.conf.*.js", // protractor config
        ],
        "optionalDependencies": false,
      },
    ],
  },
};
