<frontmatter title="Shorthand Syntax" />

# Shorthand Syntax Handling

<box type="info">
This tests if &lt;span heading&gt; is auto-converted by the plugin.
</box>

## Case 1: Valid Shorthand Inside Panel
<panel><span heading>Heading</span></panel>

## Case 2: Invalid Use (No Attribute)
<panel><span>Heading</span></panel>

## Case 3: Wrong Container
<div><span heading>Should not convert</span></div>
