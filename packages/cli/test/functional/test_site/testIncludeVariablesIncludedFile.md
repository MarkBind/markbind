{% set included_variable = "Import should be overridden by include variable - This should not appear" %}
{% set global_variable = "Import should be overridden by global variable - This should not appear" %}

{{ included_variable_in_outer_included_file }}

{{ included_variable_inner_overridden }}
