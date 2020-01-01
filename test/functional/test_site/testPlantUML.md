**PlantUML Test**

**Sequence Diagram**
<puml src="diagrams/sequence.puml" />

**Use Case Diagram**
<puml src="diagrams/usecase.puml" />

**Class Diagram**
<puml src="diagrams/class.puml" />

**Activity Diagram**
<puml src="diagrams/activity.puml" />

**Component Diagram**
<puml src="diagrams/component.puml" />

**State Diagram**
<puml src="diagrams/state.puml" />

**Object Diagram**
<puml src="diagrams/object.puml" />

**PlantUML Inline Test**

<puml name="inline-output">

```puml
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
</puml>

<puml>

```puml
@startuml
object Object01
object Object02
object Object03
object Object04
object Object05
object Object06
object Object07
object Object08
object user {
  name = "Dummy"
  id = 123
}
Object01 <|-- Object02
Object03 *-- Object04
Object05 o-- "4" Object06
Object07 .. Object08 : some labels
@enduml
```
</puml>