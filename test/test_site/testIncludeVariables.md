# Test included variable
{{ included_variable }}

# Test included variable with markdown
{{ included_variable_with_markdown }}

# Test included variable as attribute
<p style="{{ included_variable_as_attribute }}">Test</p>

# Test included variable as html element
{{ included_variable_as_html_element }}

# Test included variable overridden by variables.md
{{ global_variable_overriding_included_variable }}

# Test included variables in included file
<include src="testIncludeVariablesIncludedFile.md">
  <span id="included_variable_inner_overridden">Included variable overridden by outer variable</span>
  <span id="included_variable_should_not_leak_inner">Included variable should not leak into other files</span>
</include>

# Inner included variables should not leak into other files
<include src="testIncludeVariableLeakInner.md" />

# Test included variable with global variable
{{ included_variable_with_global_variable }}

{% set included_variable = "Inner variable overridden by set" %}
{% set included_global_variable = "Global variable overridden by set" %}

# Test included variable overridden by set
{{ included_variable }}
{{ included_global_variable }}

# Test missing variable with default
{{ missing_variable or "Missing Variable" }}
