<frontmatter>
title: Open Bugs
</frontmatter>

<div class="website-content">

**Bug Description**
Unable to include two class names for hr

Instruction from user guide
```markdown
Apply classes, attributes, identifiers to block level markdown (eg. paragraphs, headings)
by leaving a space before '{' {.text-success #attribute-example}
#### heading {.text-info}

--- {.border-danger}

```

Example
Code 
```markdown

### heading {.border-danger .bg-light}
```
Expected
### heading {.border-danger .bg-light}

---

However,

Code:

```markdown
HR with classname `.border-danger`

--- {.border-danger}

HR with classname `.border-danger` and `.bg-light`

--- {.border-danger .bg-light}

HR with classname `.border-danger` and `.bg-light` (separated)

--- {.border-danger} {.bg-light}


```

Result: 

HR with classname `.border-danger`

--- {.border-danger}

HR with classname `.border-danger` and `.bg-light`

--- {.border-danger .bg-light}

HR with classname `.border-danger` and `.bg-light`

--- {.border-danger} {.bg-light}



</div>
