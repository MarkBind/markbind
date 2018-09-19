<frontmatter>
title: Hello World
footer: footer.md
siteNav: site-nav.md
head: myCustomHead.md
</frontmatter>

<include src="components/header.md" />

<div class="website-content">

# Variables that reference another variable
{{education_icon}}

{{finalized_value}}

{{reference_level_4}}

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
