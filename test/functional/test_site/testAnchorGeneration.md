<frontmatter>
  title: "Anchor Generation Test"
</frontmatter>

# Root file

# should have anchor
## should have anchor
### should have anchor
#### should have anchor
##### should have anchor
###### should have anchor

<panel header="#### should have anchor">
Lorem ipsum
</panel>


<panel header="Collapsed">
    
Headings in a collapsed-by-default panel should **not** have anchors
# should not have anchor
## should not have anchor
### should not have anchor
#### should not have anchor
##### should not have anchor
###### should not have anchor
</panel>


<panel header="Expanded" expanded>
    
Headings in a expanded-by-default panel **should** have anchors
# should have anchor
## should have anchor
### should have anchor
#### should have anchor
##### should have anchor
###### should have anchor
</panel>


---
<include src="sub_site/testAnchorGenerationInclude.md" />
