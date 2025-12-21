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
    "default-param-last": "off",
    "func-names": "off",
    "no-else-return": ["error", { "allowElseIf": true }],
    "no-underscore-dangle": "off",
    "function-call-argument-newline": "off",
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
  "overrides": [
    {
      "files": "**/*.ts",
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "project": [
          "./tsconfig.lint.json",
          "./packages/core/tsconfig.lint.json",
        ],
      },
      "plugins": ["@typescript-eslint", "lodash"],
      "extends": ["airbnb-typescript/base", "plugin:lodash/recommended"],
      "rules": {
        "import/prefer-default-export": "off",
        "import/no-default-export": "error",
        "lodash/prefer-lodash-method": [0],
        "lodash/prefer-noop": [0],
        "@typescript-eslint/default-param-last": "off",
        "@typescript-eslint/indent": [
          "error",
          2,
          {
            "CallExpression": { "arguments": "first" },
            "FunctionDeclaration": { "parameters": "first" },
            "FunctionExpression": { "parameters": "first" },
          },
        ],
        "@typescript-eslint/lines-between-class-members": [
          "error",
          "always",
          { "exceptAfterSingleLine": true },
        ],
        "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": "default",
            "format": null,
            "leadingUnderscore": "allow",
          },
        ],
        "@typescript-eslint/return-await": "off",
        "@typescript-eslint/type-annotation-spacing": "error",
      },
    },
    {
      // New override for scripts folder to allow devDependency imports
      "files": ["scripts/**/*.ts"],
      "rules": {
        "import/no-extraneous-dependencies": "off",
      },
    },
    {
      // Suppress no-restricted-globals in service workers, since eslint does not allow `self` keyword,
      // which is standard in service workers.
      // See: https://github.com/airbnb/javascript/issues/1632
      "files": ["**/sw.js"],
      "rules": {
        "no-restricted-globals": "off",
      },
    },
  ],
};
