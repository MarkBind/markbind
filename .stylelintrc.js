module.exports = {
  "extends": ["stylelint-config-standard", "stylelint-config-recommended-vue"],
  "plugins": ["@stylistic/stylelint-plugin"],
  "rules": {
    "@stylistic/indentation": [4, { baseIndentLevel: 1 } ],
    // MarkBind generates some blank CSS files when initialising a site,
    // which violates the no-empty-source rule
    "no-empty-source": null
  },
  "overrides": [
    {
      // pagefind uses BEM-style class names (e.g., .pagefind-ui__result) as default.
      // Since we currently style pagefind's default UI classes, we need to ignore the kebab-case rule here. 
      // This override should be removed once we no longer rely on pagefind's default CSS classes.
      "files": ["**/pagefindSearchBar/**"],
      "rules": {
        "selector-class-pattern": null
      }
    }
  ]
};
