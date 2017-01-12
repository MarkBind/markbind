module.exports = {
  "env": {
    "node": true,
    "es6": true
  },
  "plugins": ["lodash"],
  "extends": ["eslint:recommended", "plugin:lodash/recommended"],
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "lodash/prefer-lodash-method": [
      0
    ]
  }
};