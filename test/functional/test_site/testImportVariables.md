<variable name="filename">variablesToImport</variable>

Making sure the issue here https://github.com/MarkBind/markbind/commit/48b57a18a8bfd68101b163908da4a0541756364a is fixed.

<import var deepvar from="{{filename}}.md"/>

Test import variables from src specified via variable:
{{var}}

Test import variables that itself imports other variables:
{{deepvar}}