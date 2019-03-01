
# Div with frontmatter shown tag
<div tags="tag-frontmatter-shown">
Div with shown tag
</div>

# Div with site shown tag
<div tags="tag-site-shown">
Div with site shown tag
</div>

# Div with multiple tags
<div tags="tag-site-shown tag-other">
Div with multiple tags
</div>

# Div with hidden tag (Hidden)
<div tags="tag-hidden">
**TEST FAIL** Div with hidden tag
</div>

<include src="testIncludeFileTags.md" />

# Div with tag matching general tag
<div tags="tag-exp-shown">
Div with tag matching general tag
</div>

# Div with tag matching general tag and specific tag (Hidden)
<div tags="tag-exp-hidden">
**TEST FAIL** Div with tag matching general tag expression and specific tag expression
</div>

# Div with tag matching front matter tag overridden by matching site tag
<div tags="tag-site-override-shown">
Div with tag matching front matter tag overridden by matching site tag
</div>

# Div with tag matching general front matter tag not overridden by matching specific site tag (Hidden)
<div tags="tag-site-override-hidden">
**TEST FAIL** Div with tag matching general front matter tag not overridden by matching specific site tag
</div>

# Div with tag matching general front matter tag overridden by matching specific site tag
<div tags="tag-site-override-shown">
Div with tag matching general front matter tag overridden by matching specific site tag
</div>