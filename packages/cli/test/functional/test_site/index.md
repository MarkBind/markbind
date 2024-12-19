<frontmatter>
title: Hello World
pageNav: "default"
pageNavTitle: "Testing Page Navigation"
globalOverrideProperty: "To be overridden by global override"
frontmatterOverrideProperty: "To be overridden by frontmatter override"
globalAndFrontmatterOverrideProperty: "To be overridden by frontmatter and global override"
tags: ["tag-frontmatter-shown", "tag-included-file", "+tag-exp*", "-tag-exp-hidden", "-tag-site-override-shown", "-tag-site-override-specific*"]
</frontmatter>

<div class="website-content">

**Test `<markdown>` and `<md>` elements**

<markdown>This should be wrapped in a `<p>` tag as it uses the block-level markdown renderer</markdown>

<md>
This should not be wrapped in a `<p>` tag as it uses the inline markdown renderer
</md>

<markdown class="mt-2">
```
<markdown> elements allow block-level markdown without needing a leading newline.
Hence, the contained markdown should be parsed and output as is, without any parsing errors.
</invalidhtml>
```
</markdown>

<md>
`<md>` elements allow inline-level markdown even in a non-markdown token.
Hence, the contained markdown should be parsed and output as is, without any parsing errors.
`</invalid>`.
</md>


**Test footnotes**

<include src="testFootnotes.md" />

**Test include footnotes from hash**

<include src="testHashFootnotes.md#import" />

**Nunjucks SetExt**

{% ext externalVar = "_markbind/variable.json" %}

{{ externalVar.front }} {{ externalVar.back }}

{% for val in externalVar.arrayVar %}
{{ val }}
{% endfor %}

{{ externalVar.nestedVar.nestedVarKey }}

**Variables that reference another variable**

{{finalized_value}}

{{reference_level_4}}

**Global Variables can be referenced in {% raw %}{% set %}{% endraw %}**

{% set page_variable_with_global_variable %}
Page Variable with {{ global_variable }}
{% endset %}
{{ page_variable_with_global_variable }}

**Global Variables should override {% raw %}{% set %}{% endraw %}**

{% set page_global_variable_overriding_page_variable %}
**Should not appear**: Page Variable overridden by Global Variable
{% endset %}
{{ page_global_variable_overriding_page_variable }}

**Test Page Variable and Included Variable Integrations**

{% set outerNunjucksVariable %}
Outer Nunjucks Variable
{% endset %}

<include src="testPageVariablesInInclude.md" />

# Heading with multiple keywords
<span class="keyword">keyword 1</span>
<span class="keyword">keyword 2</span>

# Heading with keyword in panel
<panel header="Panel with keyword" expanded>
  <span class="keyword">panel keyword</span>
</panel>

**Panel with heading with keyword**

<panel header="# Panel with heading" expanded>
  <span class="keyword">panel keyword</span>
</panel>

**Expanded panel without heading with keyword**

<panel header="# Panel without heading with keyword" expanded>

  # Keyword should be tagged to this heading, not the panel heading
  <span class="keyword">panel keyword</span>
</panel>

**Unexpanded panel with heading with keyword**
<panel header="# Panel with heading with keyword">

  # Keyword should be tagged to the panel heading, not this heading
  <span class="keyword">panel keyword</span>
</panel>

# Heading <include src="testTrimIncludeFragment.md#fragment" />

The `id` for the above heading should be `heading-fragment-with-leading-spaces-and-newline` in total.
This test ensures heading ids are assigned last (e.g. after `<include />`s are processed).

# Heading with included keyword
<include src="testKeyword.md" />

<include src="testKeywordHeading.md" />
<span class="keyword">Keyword with included heading</span>

# Heading with nested keyword
<div>
  <div>
    <div>
      <span class="keyword">nested keyword</span>
    </div>
  </div>
</div>

# Heading with hidden keyword
<span class="keyword d-none">invisible keyword</span>

<include src="testTags.md" />

**Normal include**

<include src="requirements/EstablishingRequirements.md" />

**Include segment**

<include src="requirements/EstablishingRequirements.md#preview" />

**Boilerplate include**

<include src="requirements/boilerTest.md" name="Boilerplate Referencing" boilerplate />

<include src="requirements/notInside.md" name="Referencing specified path in boilerplate" boilerplate="folder/inside.md"/>

**Nested include**

<include src="requirements/nestedInclude.md" />

**HTML include**

<include src="testInclude.html" />

**Include from another MarkBind site**

<include src="sub_site/index.md" />
<include src="sub_site/testReuseSubsite.md" />
<include src="sub_site/testReuseSubsite.md#imageTest" />

**Include nested sub-site directly**

<box>
<include src="sub_site/nested_sub_site/index.md" />
</box>

**Include nested sub-site from sub-site**

<box>
<include src="sub_site/testSubsiteAndNestedSubsiteBaseUrl.md" />
</box>

**Include a file using baseUrl**
<include src="{{baseUrl}}/requirements/SpecifyingRequirements.md#preview" />
<panel src="{{baseUrl}}/requirements/SpecifyingRequirements.md#preview" header="**same test with panels**" type="minimal" />

**Include a file in a sub-folder that uses baseUrl**
<include src="requirements/testBaseUrlInIncludeSrc.md" />
<panel src="requirements/testBaseUrlInIncludeSrc.md" header="**same test with panels**" type="minimal" />

**Include a file in a sub-folder that uses baseUrl using baseUrl**
<include src="{{baseUrl}}/requirements/testBaseUrlInIncludeSrc.md" />
<panel src="{{baseUrl}}/requirements/testBaseUrlInIncludeSrc.md" header="**same test with panels**" type="minimal" />

**Include a file in a sub-site that uses baseUrl**
<include src="sub_site/testBaseUrlInIncludeSrcSubSite.md" />
<panel src="sub_site/testBaseUrlInIncludeSrcSubSite.md" header="**same test with panels**" type="minimal" />

**Include a file in a sub-site that uses baseUrl using baseUrl**
<include src="{{baseUrl}}/sub_site/testBaseUrlInIncludeSrcSubSite.md" />
<panel src="{{baseUrl}}/sub_site/testBaseUrlInIncludeSrcSubSite.md" header="**same test with panels**" type="minimal" />

**Trimmed include** 

**<include src="testTrimInclude.md" trim inline />**

**Trimmed include fragment**

**Before | <include src="testTrimIncludeFragment.md#fragment" trim inline /> | After**

**Include with custom variables**

<include src="testIncludeVariables.md" var-included_variable_as_include_attribute="Included variable as include attribute">
  <variable name="included_variable">Included variable</variable>
  <variable name="included_variable_with_markdown">__**Included variable with markdown**__</variable>
  <variable name="included_variable_as_attribute">color: blue</variable>
  <variable name="included_variable_as_html_element"><span>Included variable within HTML element</span></variable>
  <variable name="global_variable_overriding_included_variable">**Should not appear**: Included variable overridden by global variable</variable>
  <variable name="included_variable_inner_overridden">Included variable overriding inner variable</variable>
  <variable name="included_variable_in_outer_included_file">Included variable in outer included file</variable>
  <variable name="included_variable_should_not_leak">**Should not appear**: Included variable should not leak into other files</variable>
  <variable name="included_variable_with_global_variable">Included variable with {{ global_variable }}</variable>
</include>

Variables for includes should not be recognised as page variables, hence, there should be no text between **this**

{{ included_variable }}

and **this**.

**Included variables should not leak into other files**

<include src="testIncludeVariableLeak.md" />

**Panel with shorthand heading syntax**

<panel>
    <span heading>
        Heading
    </span>
</panel>

**Panel without src**

<panel header="## Panel without src header" expanded>
<markdown>
**Panel without src content heading**
</markdown> 
</panel>

**Panel with normal src**

<panel header="## Panel with normal src header" src="testPanels/PanelNormalSource.md" expanded>
</panel>    

**Panel with src from a page segment**

<panel header="## Panel with src from a page segment header" src="testPanels/PanelSourceContainsSegment.md#segment" expanded>
</panel>

**Panel with boilerplate**

<panel header="## Boilerplate referencing" src="testPanels/boilerTestPanel.md"  boilerplate expanded>
</panel>

<panel header="## Boilerplate referencing 2" src="testPanelsDuplicate/boilerTestPanel.md"  boilerplate expanded>
</panel>

<panel header="## Referencing specified path in boilerplate" src="testPanels/notInside.md" boilerplate="folder/panelBoilerplate.md" expanded>
</panel>

**Nested panel**

<panel header="## Outer nested panel" src="testPanels/NestedPanel.md" expanded>
</panel>

**Nested panel without src**

<panel header="## Outer nested panel without src" expanded>

  **Panel content of outer nested panel**

  <panel header="## Inner panel header without src" expanded>
  
  **Panel content of inner nested panel**

  </panel>
</panel>

**Panel with src from another MarkBind site**

<panel header="## Panel with src from another MarkBind site header" src="sub_site/index.md" expanded>
</panel>
<panel header="## Panel with src from another MarkBind site header" src="sub_site/testReuseSubsite.md" expanded>
</panel>
</div>

**Modal with panel inside**

<trigger for="modal-with-panel">trigger</trigger>

<modal header="modal title with panel inside" id="modal-with-panel">
  <panel header="## Panel inside modal" expanded>
  
  **Panel content inside modal**

  </panel>
</modal>

**The button of modal inside dismissible box should be properly positioned**
<box dismissible>

<include src="testModal/DismissibleBox.md#example"/>

</box>

**Unexpanded panel**

<panel header="## Unexpanded panel header">

  **Panel content of unexpanded panel should not appear in search data**

  <panel header="## Panel header inside unexpanded panel should not appear in search data" expanded>
  
  **Panel content inside unexpanded panel should not appear in search data**

  </panel>
</panel>

**Test panel closing transitions**
<include src="testPanelsClosingTransition.md" />

**Test popover has no stray space**
(<popover content="content">There should be no stray space before this</popover>)

**Test tooltip has no stray space**
(<tooltip content="content">There should be no stray space before this</tooltip>)

**Test search indexing**

**Test PlantUML live reload without include**
<puml src="diagrams/activity.puml" alt="activity diagram" />

**Test PlantUML live reload with include**
<include src="testPlantUML.md" />

**Test PlantUML in sub folder**
<include src="sub_site/testPlantUMLSubFolderInclude.md" />

## Level 2 header (inside headingSearchIndex) with no-index attribute should not be indexed {.no-index}

###### Level 6 header (outside headingSearchIndex) with always-index attribute should be indexed {.always-index}

**Test nunjucks raw tags**

<include src="testInlineExpansion.md" />

{% raw %}

<div v-pre>{{ variable interpolation syntax can be used with v-pre }}</div>
<div v-pre>{{ nonExistentVariable }}</div>
<code>{{ code elements should automatically be assigned v-pre }}</code>

{% endraw %}
