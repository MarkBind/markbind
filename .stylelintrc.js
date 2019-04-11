module.exports = {
  "extends": "stylelint-config-standard",
  "rules": {
    "indentation": 4,
    // MarkBind generates some blank CSS files when initialising a site,
    // which violates the no-empty-source rule
    "no-empty-source": null
  }
};
