Test for nunjucks' various functions that use a path.
By design, nunjucks' relative paths resolve from the configured template root directory.

Hence, in MarkBind, these paths should also follow this behaviour.
The root directory in this case is the respective root directory of the root site or sub sites.

{% set includeFilePath = "testNunjucksPathResolvingInclude.md" %}

---

**Test {% raw %}{% include %}{% endraw %}**

{% include includeFilePath %}

---

**Test {% raw %}{% import %}{% endraw %}**

{% from includeFilePath import variableToImport %}

{{ variableToImport }}

---
