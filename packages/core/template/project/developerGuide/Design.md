---
  layout: default.md
  title: "Design"
  pageNav: 3
---

# Design

<box type="tip">
This section describes the architecture of your app, explaining how the main components work and interact with each other. Using architecture diagrams is recommended.
</box>

### Architecture

The ***Architecture Diagram*** given below explains the high-level design of the ProjectEx App.

<puml src="../diagrams/example.puml" width=300 />
<box type="info">

Replace the above example diagram with an Architecture Diagram of your project created using [`puml` feature](https://markbind.org/userGuide/components/imagesAndDiagrams.html#diagrams).
</box>

Given below is a quick overview of main components and how they interact with each other.

**Main components of the architecture**

The bulk of the app's work is done by the following components:

* [**`Component 1`**](#component-1): Does something.
* [**`Component 2`**](#component-2): Does something.

**Interactions between architecture components**

The *Sequence Diagram* below shows how the components interact with each other for a certain scenario.

<annotate src="../images/johndoe.png" width="300" alt="Sample Image">
  <!-- Minimal Point -->
  <a-point x="25%" y="25%" content="This point is 25% from the left and 25% from the top" />
  <!-- Customize Point Size (default size is 40px) -->
  <a-point x="50%" y="25%" content="This point is 50% from the left and 25% from the top"  size="60"/>
  <!-- Customize Point Header (default is empty) -->
  <a-point x="75%" y="25%" content="This point is 75% from the left and 25% from the top"  header="This has a header"/>
  <!-- Customize Point Color (default color is green) -->
  <a-point x="33%" y="50%" content="This point is 33% from the left and 50% from the top"  color="red"/>
  <!-- Customize Point Opacity (default opacity is 0.3) -->
  <a-point x="66%" y="50%" content="This point is 66% from the left and 50% from the top"  opacity="0.7"/>
  <!-- Customize Point Label (default is empty) -->
  <a-point x="25%" y="75%" content="This point is 25% from the left and 75% from the top" label="1"/>
  <!-- Customize Text Color (default color is black) -->
  <a-point x="50%" y="75%" content="This point is 50% from the left and 75% from the top"  textColor="white" color="black" label="2" opacity="1"/>
  <!-- Customize Font Size (default font size is 14) -->
  <a-point x="75%" y="75%" content="This point is 75% from the left and 75% from the top"  fontSize="30" label="3"/>
</annotate>
<box type="info">

For diagrams like your Sequence Diagram, it can also be created using [`annotate` feature](https://markbind.org/userGuide/components/imagesAndDiagrams.html#annotations), that will allow you to annotate specific parts of your diagram.
</box>

The sections below give more details of each component.

<box type="tip">

**Tip:** Describe in each section how each component works in detail, including its classes, methods, and how it interacts with other components.

You can use a combination of Markbind's [**Diagrams** feature](https://markbind.org/userGuide/components/imagesAndDiagrams.html#diagrams) to provide a visual representation of each component, such as architecture and sequence diagrams.
</box>

### Component 1

Component 1 is made up of parts e.g.`A`, `B`, `C` etc.

<pic src="../images/johndoe.png" width="200px" style="margin-bottom: 20px;">
Diagram: Component 1
</pic>

Component 1,

* works with Component 2 in this way.

### Component 2

<box type="info" seamless>

**Note:** You can use boxes to include details that you want to draw the reader's attention to. See [`Boxes` feature](https://markbind.org/userGuide/components/presentation.html#boxes).
</box>

<pic src="../images/johndoe.png" width="200px" style="margin-bottom: 20px;">
Diagram: Component 2
</pic>

Component 2,

* works with Component 1 in this way.
