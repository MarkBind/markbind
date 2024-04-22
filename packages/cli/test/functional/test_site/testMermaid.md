**Mermaid Test**

<mermaid>
%%{init: { "theme": "neutral" } }%%

graph TD;
A-->B;
A-->C;
B-->D;
C-->D;
</mermaid>

<mermaid>
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
</mermaid>

<mermaid>
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
</mermaid>

<mermaid>
gantt
dateFormat  YYYY-MM-DD
title Adding GANTT diagram to mermaid
section A section
Completed task            :done,    des1, 2014-01-06,2014-01-08
Active task               :active,  des2, 2014-01-09, 3d
Future task               :         des3, after des2, 5d
Future task2               :         des4, after des3, 5d

section Critical tasks
Completed task in the critical line :crit, done, 2014-01-06,24h
Implement parser and jison          :crit, done, after des1, 2d
Create tests for parser             :crit, active, 3d
Future task in critical line        :crit, 5d
Create tests for renderer           :2d
Add to mermaid                      :1d

section Documentation
Describe gantt syntax               :active, a1, after des1, 3d
Add gantt diagram to demo page      :after a1  , 20h
Add another diagram to demo page    :doc1, after a1  , 48h

section Last section
Describe gantt syntax               :after doc1, 3d
Add gantt diagram to demo page      : 20h
Add another diagram to demo page    : 48h
</mermaid>

<panel type="minimal" header="This is to test Mermaid diagrams work in panel.">
<mermaid>
pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15
</mermaid>
</panel>

<include src="testMermaidInclude.md" />

<panel type="minimal" header="This is to test Mermaid diagrams works when included inside a panel." src="testMermaidInclude.md" />
