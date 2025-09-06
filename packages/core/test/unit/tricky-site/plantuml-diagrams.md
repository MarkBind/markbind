<frontmatter title="PlantUML Diagrams" />

# PlantUML Rendering Test

<box type="info">
This page shows how PlantUML plugin handles inline and external diagrams.
</box>

## Inline Diagram
<puml width=300>
@startuml
Alice -> Bob : Hello
Bob -> Bob : Self Call
@enduml
</puml>

## Named Diagram
<puml name="alice">
@startuml
Alice -> Bob : Hello again
@enduml
</puml>

## Referenced External Diagram (simulated)
<puml src="activity.puml" />
