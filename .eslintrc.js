module.exports = {
  "env": {
    "node": true,
    "es6": true
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
      }
    ],
    "lodash/prefer-lodash-method": [0],
    "lodash/prefer-noop": [0],
    "max-len": ["error", { "code": 110 }],
    "operator-linebreak": ["error", "before"],
  }
};
