## Diagrams

### PlantUML Diagrams
You can use the [PlantUML](http://plantuml.com/) syntax to add diagrams.

<box type="warning">

**The following additional dependencies are involved when using this feature** *(**locally** and in your <tooltip content="E.g: Building & deploying the site via GitHub Actions">**CI/CD environment**</tooltip>)*

* Java 8 or higher (required - to run the PlantUML JAR executable)
* [Graphviz](https://www.graphviz.org/download/) {{ graphviz_version }} or higher (optional - you don't need this if you are on Windows, or only need [sequence diagrams](https://plantuml.com/sequence-diagram) and [activity (beta) diagrams](https://plantuml.com/activity-diagram-beta))
  * A warning will be displayed if you are using a non-Windows platform and don't have Graphviz installed. To disable this warning, you may modify your `site.json` like <trigger for="pop:prerequisite-disable" placement="bottom" trigger="click">this</trigger>.
  * An alternative layout engine, [Smetana](https://plantuml.com/smetana02), is integrated into PlantUML and can be used to generate diagrams without a Graphviz installation. However, as the Smetana engine is a work in progress, certain layouts may not render correctly. 

<modal header="Disabling PlantUML's prerequisite check in `site.json`" id="pop:prerequisite-disable" backdrop>
  <include src="{{ baseUrl }}/userGuide/siteJsonFile.md#plantuml-check"/>
</modal>

<panel header="Example: Installing the above dependencies in GitHub Actions" minimized>
The following steps can be <tooltip content="Before the build step">added</tooltip> in your workflow file to install Graphviz and Java in Ubuntu.

```yaml {heading="action.yml"}
steps:
  - name: Install Graphviz
    run: sudo apt-get install graphviz
  - name: Install Java
    uses: actions/setup-java@v3
    with:
      java-version: '11'
      distribution: 'temurin'
```

See [Deploying via Github Actions](../deployingTheSite.html#deploying-via-github-actions) for more information.

</panel>

</box>

<div id="main-example">
<include src="codeAndOutput.md" boilerplate>
<variable name="code">

<puml width="300">
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
</puml>
</variable>

</include>
</div>

Alternatively, a PlantUML diagram can be specified in a separate `.puml` file and inserted into a page using a `<puml>` tag.

<include src="outputBox.md" boilerplate>
<variable name="code">

`diagrams/sequence.puml`:
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

in another file:
```html
<puml src="diagrams/sequence.puml" width=300 />
```
</variable>

<variable id="output">
<puml src="../diagrams/sequence.puml" width=300 />
</variable>

</include>

<box type="info">

The full PlantUML syntax reference can be found at plantuml.com/guide
</box>

<panel header="More examples">

<div id="puml-examples">

**Sequence Diagram**:<br>
<puml src="../diagrams/sequence.puml" />

**Use Case Diagram**:<br>
<puml src="../diagrams/usecase.puml" />

**Class Diagram**:<br>
<puml src="../diagrams/class.puml" />

**Activity Diagram**:<br>
<puml src="../diagrams/activity.puml" />

**Component Diagram**:<br>
<puml src="../diagrams/component.puml" />

**State Diagram**:<br>
<puml src="../diagrams/state.puml" />

**Object Diagram**:<br>
<puml src="../diagrams/object.puml" />

**Gantt Diagram**:<br>
<puml src="../diagrams/gantt.puml" />

**Entity Relation Diagram**:<br>
<puml src="../diagrams/entityrelation.puml" />

**Ditaa Diagram**:<br>
<puml src="../diagrams/ditaa.puml" />

**Archimate Diagram**:<br>
<puml src="../diagrams/archimate.puml" />

</div>
</panel>
<p/>

****Options****
Name | Type     | Description
-----|----------|-------------------------------------
alt  | `string` | The alternative text of the diagram.
height | `string` | The height of the diagram in pixels.
name   | `string` | The name of the output file.<br>Avoid using the same name for different diagrams to prevent overwriting.
src    | `string` | The URL of the diagram if your diagram is in another `.puml` file.<br>The URL can be specified as absolute or relative references. More info in: _[Intra-Site Links]({{baseUrl}}/userGuide/formattingContents.html#intraSiteLinks)_
width  | `string` | The width of the diagram in pixels.<br>If both width and height are specified, width takes priority over height. It is to maintain the diagram's aspect ratio.

<box type="tip">


It's also possible to utilize JavaScript diagram libraries such as [Mermaid](https://mermaid-js.github.io/mermaid/) via the [Mermaid plugin](../usingPlugins.html#plugin-mermaid).

</box>

<div id="short" class="d-none">

```
<puml width=300>
@startuml
alice -> bob ++ : hello
bob -> bob ++ : self call
@enduml
</puml>
```

</div>
<div id="examples" class="d-none">

<include src="diagrams.md#puml-examples" />

</div>

### Mermaid Diagrams

You can use [Mermaid](https://mermaid-js.github.io/mermaid/) syntax to add diagrams with the [Mermaid plugin]({{ baseUrl }}/userGuide/usingPlugins.html#plugin-mermaid).

<include src="{{ baseUrl }}/userGuide/plugins/mermaid.md#text" />
