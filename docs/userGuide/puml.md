<variable name="title" id="title">PlantUML Diagrams</variable>
<frontmatter>
  title: "User Guide - {{ title }}"
  layout: userGuide
</frontmatter>


# {{ title }}


<span id="overview" class="lead">

**MarkBind offers integration with PlantUML in your pages,** allowing you design and write UML diagrams (and [more](http://plantuml.com/)) using PlantUML syntax, which is then compiled and served as images.
</span>

<box type="warning">

**[Java](https://www.java.com/en/download/) and 
[Graphviz](https://www.graphviz.org/download/)
must be installed to use this feature**

* Java 8 or later (required to run the PlantUML JAR executable)
* Graphviz v2.38 or later (required to generate _all_ diagrams)

</box>

## Usage

A PlantUML diagram file (.puml) can be inserted into a Markbind page using a `<puml>` tag. The `<puml>` tag supports
the same attributes as the `<pic>` tag, listed below:

****Options****
Name | Type | Default | Description 
--- | --- | --- | ---
alt | `string` | | **This must be specified.**<br>The alternative text of the diagram.
height | `string` | | The height of the diagram in pixels.
src | `string` | | **This must be specified.**<br>The URL of the diagram.<br>The URL can be specified as absolute or relative references. More info in: _[Intra-Site Links]({{baseUrl}}/userGuide/formattingContents.html#intraSiteLinks)_
width | `string` | | The width of the diagram in pixels.<br>If both width and height are specified, width takes priority over height. It is to maintain the diagram's aspect ratio.


### Example

<include src="outputBox.md" boilerplate>
<span id="code">

_diagrams/sequence.puml_:
```
@startuml
alice -> bob ++ : hello
bob -> bob ++ : self call
bob -> bib ++  #005500 : hello
bob -> george ** : create
return done
return rc
bob -> george !! : delete
return success
@enduml
```

_Markbind page_:
```
<puml src="diagrams/sequence.puml" width=300/>
```

</span>

<span id="output">
<puml src="diagrams/sequence.puml" width=300/>
</span>

</include>

<box type="info">

The full PlantUML syntax reference can be found at plantuml.com/guide
</box>

<panel header="More examples">

### Sequence Diagram
<puml src="diagrams/sequence.puml"/>

### Use Case Diagram
<puml src="diagrams/usecase.puml"/>

### Class Diagram
<puml src="diagrams/class.puml"/>

### Activity Diagram
<puml src="diagrams/activity.puml"/>

### Component Diagram
<puml src="diagrams/component.puml"/>

### State Diagram
<puml src="diagrams/state.puml"/>

### Object Diagram
<puml src="diagrams/object.puml"/>

### Gantt Diagram
<puml src="diagrams/gantt.puml"/>

### Entity Relation Diagram
<puml src="diagrams/entityrelation.puml"/>

### Ditaa Diagram
<puml src="diagrams/ditaa.puml"/>

### Archimate Diagram
<puml src="diagrams/archimate.puml"/>

</panel>


{% from "njk/common.njk" import previous_next %}
{{ previous_next('formattingContents', 'usingComponents') }}
