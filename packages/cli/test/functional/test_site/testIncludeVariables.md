
**Test included variable as include attribute**

{{ included_variable_as_include_attribute }}

**Test included variable**

{{ included_variable }}

**Test included variable with markdown**

{{ included_variable_with_markdown }}

**Test included variable as attribute**

<p style="{{ included_variable_as_attribute }}">Test</p>

**Test included variable as html element**

{{ included_variable_as_html_element }}

**Test included variable overridden by variables.md**

{{ global_variable_overriding_included_variable }}

**Test included variables in included file**

<include src="testIncludeVariablesIncludedFile.md">
  <variable name="included_variable_inner_overridden">Included variable overridden by outer variable</variable>
  <variable name="included_variable_should_not_leak_inner">Included variable should not leak into other files</variable>
</include>

**Inner included variables should not leak into other files**

<include src="testIncludeVariableLeakInner.md" />

**Test included variable with global variable**

{{ included_variable_with_global_variable }}

{% set included_variable = "Set should be overridden by include variable - This should not appear" %}
{% set global_variable = "Set should be overridden by global variable - This should not appear" %}

**Test nunjucks set overridden by include variable and global variable**

{{ included_variable }}
{{ global_variable }}

{% from "testIncludeVariablesIncludedFile.md" import included_variable, global_variable %}

**Test nunjucks import overridden by include variable and global variable**

{{ included_variable }}
{{ global_variable }}


{% include "testIncludeVariablesInner.md" %}

**Test missing variable with default**

{{ missing_variable or "Missing Variable" }}
