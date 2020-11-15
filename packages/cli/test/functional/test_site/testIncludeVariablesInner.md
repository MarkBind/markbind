{% set included_variable = "Set should be overridden by include variable - This should not appear" %}
{% set global_variable = "Set should be overridden by global variable - This should not appear" %}

**Test nunjucks set overridden by include variable and global variable in nested include**

{{ included_variable }}
{{ global_variable }}

{% from "testIncludeVariablesIncludedFile.md" import included_variable, global_variable %}

**Test nunjucks import overridden by include variable and global variable in nested include**

{{ included_variable }}
{{ global_variable }}
