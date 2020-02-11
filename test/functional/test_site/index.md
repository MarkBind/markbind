<frontmatter>
title: Hello World
header: header.md
footer: footer.md
siteNav: site-nav.md
pageNav: "default"
pageNavTitle: "Testing Page Navigation"
globalOverrideProperty: "To be overridden by global override"
frontMatterOverrideProperty: "To be overridden by frontmatter override"
globalAndFrontMatterOverrideProperty: "To be overridden by frontmatter and global override"
head: myCustomHead.md, myCustomHead2.md
tags: ["tag-frontmatter-shown", "tag-included-file", "+tag-exp*", "-tag-exp-hidden", "-tag-site-override-shown", "-tag-site-override-specific*"]
</frontmatter>

<div class="website-content">

**Test footnotes**

<include src="testFootnotes.md" />

**Variables that reference another variable**

{{finalized_value}}

{{reference_level_4}}

**Page Variable**

<variable name="page_variable">Page Variable</variable>
{{ page_variable }}

**Page Variable with HTML and MD**

<variable name="page_variable_with_HTML_and_MD">Page Variable with <span style="color: blue;">HTML</span> and **Markdown**</variable>
{{ page_variable_with_HTML_and_MD }}

**Nested Page Variable**

<div>
  <span>
    <variable name="nested_page_variable">Nested Page Variable</variable>
  </span>
</div>
{{ nested_page_variable }}

**Page Variable with Global Variable**

<variable name="page_variable_with_global_variable">Page Variable with {{ global_variable }}</variable>
{{ page_variable_with_global_variable }}

**Page Variable referencing Page Variable**

<variable name="page_variable_referencing_page_variable">Page Variable referencing {{ page_variable }}</variable>
{{ page_variable_referencing_page_variable }}

**Global Variable overriding Page Variable**

<variable name="page_global_variable_overriding_page_variable">**Should not appear**: Page Variable overridden by Global Variable</variable>
{{ page_global_variable_overriding_page_variable }}

**Test Page Variable and Included Variable Integrations**

<variable name="explicitly_included_page_variable">Explicitly Included Page Variable</variable>
<include src="testPageVariablesInInclude.md">
  <variable name="explicitly_included_page_variable">{{ explicitly_included_page_variable }}</variable>
  <variable name="included_variable">Included Variable</variable>
  <variable name="included_variable_overriding_page_variable">Included Variable Overriding Page Variable</variable>
</include>

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

<!-- **Dynamic include**

<include src="requirements/SpecifyingRequirements.md" name="Dynamic Include" dynamic /> -->

**Boilerplate include**

<include src="requirements/boilerTest.md" name="Boilerplate Referencing" boilerplate />

<include src="requirements/notInside.md" name="Referencing specified path in boilerplate" boilerplate="folder/inside.md"/>

**Nested include**

<include src="requirements/nestedInclude.md" />

**HTML include**

<include src="testInclude.html" />

**Mbd, Mbdf include**

<include src="testIncludeMbd.mbd" />
<include src="testIncludeMbdf.mbdf" />

**Include from another Markbind site**

<include src="sub_site/index.md" />
<include src="sub_site/testReuse.md" />

**Include segment from another Markbind site**

<include src="sub_site/testReuse.md#imageTest" />

**Trimmed include** 

**<include src="testTrimInclude.md" trim inline />**

**Trimmed include fragment**

**Before | <include src="testTrimIncludeFragment.mbdf#fragment" trim inline /> | After**

**Include with custom variables**

<include src="testIncludeVariables.md" var-included_variable_as_include_attribute="Included variable as include attribute">
  <variable name="included_variable">Included variable</variable>
  <variable name="included_variable_with_markdown">__**Included variable with markdown**__</variable>
  <variable name="included_variable_as_attribute">color: blue</variable>
  <variable name="included_variable_as_html_element"><span>Included variable within html element</span></variable>
  <variable name="global_variable_overriding_included_variable">**Should not appear**: Included variable overridden by global variable</variable>
  <variable name="included_variable_inner_overridden">Included variable overriding inner variable</variable>
  <variable name="included_variable_in_outer_included_file">Included variable in outer included file</variable>
  <variable name="included_variable_should_not_leak">**Should not appear**: Included variable should not leak into other files</variable>
  <variable name="included_variable_with_global_variable">Included variable with {{ global_variable }}</variable>
</include>

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

**Panel with src from another Markbind site**

<panel header="## Panel with src from another Markbind site header" src="sub_site/index.md" expanded>
</panel>
<panel header="## Panel with src from another Markbind site header" src="sub_site/testReuse.md" expanded>
</panel>
</div>

**Modal with panel inside**

<trigger for="modal-with-panel">trigger</trigger>

<modal header="modal title with panel inside" id="modal-with-panel">
  <panel header="## Panel inside modal" expanded>
  
  **Panel content inside modal**

  </panel>
</modal>

**Unexpanded panel**

<panel header="## Unexpanded panel header">

  **Panel content of unexpanded panel should not appear in search data**

  <panel header="## Panel header inside unexpanded panel should not appear in search data" expanded>
  
  **Panel content inside unexpanded panel should not appear in search data**

  </panel>
</panel>

**Test plugin in markbind/plugins**

<div id="test-markbind-plugin">
  Markbind Plugin Pre-render Placeholder
</div>

**Test search indexing**

**Test PlantUML live reload without include**
<puml src="diagrams/activity.puml" alt="activity diagram" />

**Test PlantUML live reload with include**
<include src="testPlantUML.md" />

## Level 2 header (inside headingSearchIndex) with no-index attribute should not be indexed {.no-index}

###### Level 6 header (outside headingSearchIndex) with always-index attribute should be indexed {.always-index}
