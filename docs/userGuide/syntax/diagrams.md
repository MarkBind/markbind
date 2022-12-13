## Diagrams

You can use the [PlantUML](http://plantuml.com/) syntax to add diagrams.

<box type="warning">

**The following additional dependencies are involved when using this feature** *(**locally** and in your <tooltip content="E.g: Building & deploying the site via GitHub Actions">**CI/CD environment**</tooltip>)*

* Java 8 or later (required - to run the PlantUML JAR executable)
* [Graphviz](https://www.graphviz.org/download/) v2.38 or later (optional - you don't need this if you only need [sequence diagrams](https://plantuml.com/sequence-diagram) and [activity (beta) diagrams](https://plantuml.com/activity-diagram-beta))
  * A warning will be displayed if you don't have Graphviz installed. To disable this warning, you may modify your `site.json` like <trigger for="pop:prerequisite-disable" placement="bottom" trigger="click">this</trigger>.

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
<include src="outputBox.md" boilerplate>
<variable name="code">

```
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
```
</variable>

<variable name="output">
<pic src="../diagrams/sequence.png" width="300" />
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
<pic src="../diagrams/sequence.png" width="300" />
</variable>

</include>

<box type="info">

The full PlantUML syntax reference can be found at plantuml.com/guide
</box>

<panel header="More examples">

<div id="puml-examples">

**Sequence Diagram**:<br>
<pic src="../diagrams/sequence.png" />

**Use Case Diagram**:<br>
<pic src="../diagrams/usecase.png" />

**Class Diagram**:<br>
<pic src="../diagrams/class.png" />

**Activity Diagram**:<br>
<pic src="../diagrams/activity.png" />

**Component Diagram**:<br>
<pic src="../diagrams/component.png" />

**State Diagram**:<br>
<pic src="../diagrams/state.png" />

**Object Diagram**:<br>
<pic src="../diagrams/object.png" />

**Gantt Diagram**:<br>
<pic src="../diagrams/gantt.png" />

**Entity Relation Diagram**:<br>
<pic src="../diagrams/entityrelation.png" />

**Ditaa Diagram**:<br>
<pic src="../diagrams/ditaa.png" />

**Archimate Diagram**:<br>
<pic src="../diagrams/archimate.png" />

</div>
</panel>
<p/>

****Options****
Name | Type | Description
--- | --- | ---
alt | `string` | The alternative text of the diagram.
height | `string` | The height of the diagram in pixels.
name | `string` | The name of the output file.
src | `string` | The URL of the diagram if your diagram is in another `.puml` file.<br>The URL can be specified as absolute or relative references. More info in: _[Intra-Site Links]({{baseUrl}}/userGuide/formattingContents.html#intraSiteLinks)_
width | `string` | The width of the diagram in pixels.<br>If both width and height are specified, width takes priority over height. It is to maintain the diagram's aspect ratio.

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
