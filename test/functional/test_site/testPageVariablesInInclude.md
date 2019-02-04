# Outer Page Variable Overriding Inner Page Variable
<variable name="page_variable">Inner Page Variable Overridden by Outer Page Variable</variable>
{{ page_variable }}

# Included Variable Overriding Page Variable
<variable name="included_variable_overriding_page_variable">Page Variable Overridden by Included Variable</variable>
{{ included_variable_overriding_page_variable }}

# Page Variable Referencing Included Variable
<variable name="page_variable_referencing_included_variable">Page Variable Referencing {{ included_variable }}</variable>
{{ page_variable_referencing_included_variable }}

# Page Variable Referencing Outer Page Variable
<variable name="page_variable_referencing_outer_page_variable">Page Variable Referencing Outer {{ page_variable }}</variable>
{{ page_variable_referencing_outer_page_variable }}
