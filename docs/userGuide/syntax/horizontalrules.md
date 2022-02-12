## Horizontal Rules

Use three or more asterisks (`***`), dashes (`---`), or underscores (`___`) to indicate a horizontal line.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
*****
-----
______________
</variable>
</include>

### Different Types Of Horizontal Rules

Add additional classes to modify the style, thickness, and color of a horizontal line. 

Available style classes:
- dotted
- dashed
- double

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

--- {.dotted}

--- {.dashed}

--- {.double}

</variable>
</include>

Available size classes:
- thick
- thick-1
- thick-2
- thick-3

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

--- {.thick}

--- {.thick-1}

--- {.thick-2}

--- {.thick-3}

</variable>
</include>

Available color classes (use any of the available BootStrap border color classes):
- border-info
- border-primary
- etc

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

--- {.border-primary}

--- {.border-secondary}

--- {.border-danger}

--- {.border-info}

--- {.border-success}

</variable>
</include>

Add a comibnation of the above classes to further customize the style of a horizontal line. 

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

--- {.dashed .thick-3}

--- {.double .border-secondary}

--- {.dotted .thick-1 .border-primary}

</variable>
</include>

<span id="short" class="d-none">

```markdown
*****
-----
______________
```
</span>

<span id="examples" class="d-none">

----
</span>
