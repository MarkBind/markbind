<variable name="referenced_value">This variable can be referenced.</variable>
<variable name="finalized_value">{{referenced_value}}</variable>

<variable name="reference_level_1">References can be several levels deep.</variable>
<variable name="reference_level_2">{{reference_level_1}}</variable>
<variable name="reference_level_3">{{reference_level_2}}</variable>
<variable name="reference_level_4">{{reference_level_3}}</variable>

<variable name="global_variable_overriding_included_variable">Global Variable Overriding Included Variable</variable>
<variable name="global_variable">Global Variable</variable>
<variable name="page_global_variable_overriding_page_variable">Global Variable Overriding Page Variable</variable>
<variable from="variable.json"></variable>
<variable name="base2">2019-01-01</variable>
<variable name="formatted_date">{{ base2 | date("ddd D MMM", 10) }}</variable>
