# Test included variable
{{ includedVariable }}

# Test included variable with markdown
{{ includedVariableWithMarkdown }}

# Test included variable as attribute
<p style="{{ includedVariableAsAttribute }}">Test</p>

# Test included variable as html element
{{ includedVariableAsHtmlElement }}

# Test included variable overriden by variables.md
{{ includedVariableGlobalOverriden }}

# Test included variables in included file
<include src="testIncludeVariablesIncludedFile.md">
  <span id="includedVariableInnerOverriden">Included variable overridden by outer variable</span>
  <span id="includedVariableShouldNotLeakInner">Included variable should not leak into other files</span>
</include>

# Inner included variables should not leak into other files
<include src="testIncludeVariableLeakInner.md" />

# Test included variable with global variable
{{ includedVariableWithGlobalVariable }}

# Test included variable with local variable
{{ includedVariableWithLocalVariable }}

{% set includedVariable = "Inner variable overriden by set" %}
{% set includedGlobalVariable = "Global variable overriden by set" %}

# Test included variable overriden by set
{{ includedVariable }}
{{ includedGlobalVariable }}

# Test missing variable with default
{{ missingVariable or "Missing Variable" }}
