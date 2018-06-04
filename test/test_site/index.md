<frontmatter>
title: Hello World
footer: footer.md
</frontmatter>

<include src="components/header.md" />

<div class="website-content">

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

# Include from another Markbind site
<include src="sub_site/index.md" />

</div>
