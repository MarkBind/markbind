<frontmatter>
title: Hello World
footer: footer.md
siteNav: site-nav.md
pageNav: "default"
pageNavTitle: "Testing Page Navigation"
head: myCustomHead.md, myCustomHead2.md
</frontmatter>

<include src="components/header.md" />

<div class="website-content">

# Variables that reference another variable
{{education_icon}}

{{finalized_value}}

{{reference_level_4}}

# Page Variable
<variable name="page_variable">Page Variable</variable>
{{ page_variable }}

# Page Variable with HTML and MD
<variable name="page_variable_with_HTML_and_MD">Page Variable with <span style="color: blue;">HTML</span> and **Markdown**</variable>
{{ page_variable_with_HTML_and_MD }}

# Nested Page Variable
<div>
  <span>
    <variable name="nested_page_variable">Nested Page Variable</variable>
  </span>
</div>
{{ nested_page_variable }}

# Page Variable with Global Variable
<variable name="page_variable_with_global_variable">Page Variable with {{ global_variable }}</variable>
{{ page_variable_with_global_variable }}

# Page Variable referencing Page Variable
<variable name="page_variable_referencing_page_variable">Page Variable referencing {{ page_variable }}</variable>
{{ page_variable_referencing_page_variable }}

# Global Variable overriding Page Variable
<variable name="page_global_variable_overriding_page_variable">Page Variable overridden by Global Variable</variable>
{{ page_global_variable_overriding_page_variable }}

# Test Page Variable and Included Variable Integrations
<include src="testPageVariablesInInclude.md">
  <span id="included_variable">Included Variable</span>
  <span id="included_variable_overriding_page_variable">Included Variable Overriding Page Variable</span>
</include>

# Heading with multiple keywords
<span class="keyword">keyword 1</span>
<span class="keyword">keyword 2</span>

# Heading with keyword in panel
<panel header="Panel with keyword" expanded>
  <span class="keyword">panel keyword</span>
</panel>

# Panel with heading with keyword
<panel header="# Panel with heading" expanded>
  <span class="keyword">panel keyword</span>
</panel>

# Expanded panel without heading with keyword
<panel header="# Panel without heading with keyword" expanded>

  # Keyword should be tagged to this heading, not the panel heading
  <span class="keyword">panel keyword</span>
</panel>

# Unexpanded panel with heading with keyword
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

<include src="testTagDivs.md" />

# Normal include
<include src="requirements/EstablishingRequirements.md" />

# Include segment
<include src="requirements/EstablishingRequirements.md#preview" />

# Dynamic include
<include src="requirements/SpecifyingRequirements.md" name="Dynamic Include" dynamic />

# Boilerplate include
<include src="requirements/boilerTest.md" name="Boilerplate Referencing" boilerplate />

<include src="requirements/notInside.md" name="Referencing specified path in boilerplate" boilerplate="folder/inside.md" dynamic/>

# Nested include
<include src="requirements/nestedInclude.md" />

# HTML include
<include src="testInclude.html" />

# Mbd, Mbdf include
<include src="testIncludeMbd.mbd" />
<include src="testIncludeMbdf.mbdf" />

# Include from another Markbind site
<include src="sub_site/index.md" />

# Trimmed include

## <include src="testTrimInclude.md" trim inline />

# Include with custom variables

<include src="testIncludeVariables.md">
  <span id="included_variable">Included variable</span>
  <span id="included_variable_with_markdown">__**Included variable with markdown**__</span>
  <span id="included_variable_as_attribute">color: blue</span>
  <span id="included_variable_as_html_element"><span>Included variable within html element</span></span>
  <span id="global_variable_overriding_included_variable">Included variable overridden by global variable</span>
  <span id="included_variable_inner_overridden">Included variable overriding inner variable</span>
  <span id="included_variable_in_outer_included_file">Included variable in outer included file</span>
  <span id="included_variable_should_not_leak">Included variable should not leak into other files</span>
  <span id="included_variable_with_global_variable">Included variable with {{ global_variable }}</span>
</include>

# Included variables should not leak into other files

<include src="testIncludeVariableLeak.md" />

# Panel without src
<panel header="## Panel without src header" expanded>
<markdown>
### Panel without src content heading
</markdown> 
</panel>

# Panel with normal src
<panel header="## Panel with normal src header" src="testPanels/PanelNormalSource.md" expanded>
</panel>    

# Panel with src from a page segment
<panel header="## Panel with src from a page segment header" src="testPanels/PanelSourceContainsSegment.md#segment" expanded>
</panel>

# Panel with boilerplate 
<panel header="## Boilerplate referencing" src="testPanels/boilerTestPanel.md"  boilerplate expanded>
</panel>

<panel header="## Referencing specified path in boilerplate" src="testPanels/notInside.md" boilerplate="folder/panelBoilerplate.md" expanded>
</panel>

# Nested panel
<panel header="## Outer nested panel" src="testPanels/NestedPanel.md" expanded>
</panel>

# Nested panel without src
<panel header="## Outer nested panel without src" expanded>

  ## Panel content of outer nested panel
  <panel header="## Inner panel header without src" expanded>
  
  ## Panel content of inner nested panel
  </panel>
</panel>

# Panel with src from another Markbind site
<panel header="## Panel with src from another Markbind site header" src="sub_site/index.md" expanded>
</panel>
</div>

# Modal with panel inside
<trigger for="modal-with-panel">trigger</trigger>

<modal title="modal title with panel inside" id="modal-with-panel">
  <panel header="## Panel inside modal" expanded>
  
  ## Panel content inside modal
  </panel>
</modal>

# Unexpanded panel
<panel header="## Unexpanded panel header">

  ## Panel content of unexpanded panel should not appear in search data
  <panel header="## Panel header inside unexpanded panel should not appear in search data" expanded>
  
  ## Panel content inside unexpanded panel should not appear in search data
  </panel>
</panel>
