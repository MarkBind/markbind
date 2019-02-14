# Inner Page Variable Should Not Be Overridden by Outer Page Variable
<variable name="page_variable">Inner Page Variable Should Not Be Overridden by Outer Page Variable</variable>
{{ page_variable }}

# Outer Page Variable Should Not Leak Into Inner Pages
{{ nested_page_variable or "Outer Page Variable Should Not Leak Into Inner Pages" }}

# Included Variable Overriding Page Variable
<variable name="included_variable_overriding_page_variable">Page Variable Overridden by Included Variable</variable>
{{ included_variable_overriding_page_variable }}

# Page Variable Referencing Included Variable
<variable name="page_variable_referencing_included_variable">Page Variable Referencing {{ included_variable }}</variable>
{{ page_variable_referencing_included_variable }}
