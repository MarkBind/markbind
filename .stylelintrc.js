module.exports = {
  "extends": ["stylelint-config-standard", "stylelint-config-recommended-vue"],
  "rules": {
    // "indentation": [ 4, { baseIndentLevel: 1 } ],
    // MarkBind generates some blank CSS files when initialising a site,
    // which violates the no-empty-source rule
    "no-empty-source": null
  }
};
