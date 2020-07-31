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
    "arrow-parens": ["error", "as-needed", { "requireForBlockBody": true }],
    "func-names": "off",
    "no-else-return": ["error", { "allowElseIf": true }],
    "no-underscore-dangle": "off",
    "function-paren-newline": "off",
    "implicit-arrow-linebreak": "off",
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
    "no-param-reassign": ["error", { "props": false }],
    "operator-linebreak": ["error", "before"],
    // override airbnb-base dev dependencies, latest version does not white list __mocks__
    "import/no-extraneous-dependencies": [
      "error", {
        "devDependencies": [
          "**/test/**",
          "**/__mocks__/*",
          "**/*.{test,spec}.js",
          "**/jest.config.js",
          "**/webpack.*.js",
        ],
        "optionalDependencies": false,
      },
    ],
  },
};
