
# Test included variable
{{ includedVariable }}

# Test included variable with markdown
{{ includedVariableWithMarkdown }}

# Test included variable as attribute
<p style="{{ includedVariableAsAttribute }}">Test</p>

# Test included variable as html element
{{ includedVariableAsHtmlElement }}

# Test included variable overriding variables.md
{{ includedVariableOverriding }}

# Test included variable in included file
<include src="testIncludeVariablesIncludedFile.md">