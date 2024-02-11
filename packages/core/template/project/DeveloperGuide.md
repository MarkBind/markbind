---
  layout: default.md
  title: "Developer Guide"
  pageNav: 3
---

# ProjectEx Developer Guide

<!-- * Table of Contents -->
<page-nav-print />

--------------------------------------------------------------------------------------------------------------------

## **Acknowledgements**

_{ list here sources of all reused/adapted ideas, code, documentation, and third-party libraries -- include links to the original source as well }_

--------------------------------------------------------------------------------------------------------------------

## **Setting up, getting started**

Refer to the guide [_Setting up and getting started_](SettingUp.md).

--------------------------------------------------------------------------------------------------------------------

## **Design**

<box type="tip">
This section describes the architecture of your app, explaining how the main components work and interact with each other. Using acrhitecture diagrams is recommended.
</box>

### Architecture

<puml src="diagrams/ArchitectureDiagram.puml" width="280" />

The ***Architecture Diagram*** given above explains the high-level design of the ProjectEx App.

Given below is a quick overview of main components and how they interact with each other.

**Main components of the architecture**

**`Main`** (consisting of classes [`Main`](https://github.com/se-edu/addressbook-level3/tree/master/src/main/java/seedu/address/Main.java) and [`MainApp`](https://github.com/se-edu/addressbook-level3/tree/master/src/main/java/seedu/address/MainApp.java)) is in charge of the app launch and shut down.
* At app launch, it initializes the other components in the correct sequence, and connects them up with each other.
* At shut down, it shuts down the other components and invokes cleanup methods where necessary.

The bulk of the app's work is done by the following four components:

* [**`UI`**](#ui-component): The UI of the App.
* [**`Logic`**](#logic-component): The command executor.
* [**`Model`**](#model-component): Holds the data of the App in memory.
* [**`Storage`**](#storage-component): Reads data from, and writes data to, the hard disk.

[**`Commons`**](#common-classes) represents a collection of classes used by multiple other components.

**How the architecture components interact with each other**

The *Sequence Diagram* below shows how the components interact with each other for the scenario where the user issues the command `delete 1`.

<puml src="diagrams/ArchitectureSequenceDiagram.puml" width="574" />

Each of the four main components (also shown in the diagram above),

* defines its *API* in an `interface` with the same name as the Component.
* implements its functionality using a concrete `{Component Name}Manager` class (which follows the corresponding API `interface` mentioned in the previous point.

The sections below give more details of each component.

<box type="tip" seamless>

**Tip:** Describe in each section how each component works in detail, including its classes, methods, and how it interacts with other components. 

You can use a combination of Markbind's [**Diagrams** `puml` feature](https://markbind.org/userGuide/components/imagesAndDiagrams.html#diagrams) to provide a visual representation of each component, such as architecture and sequence diagrams.
</box>

### UI component

The UI is made up of parts e.g.`A`, `B`, `C` etc.

The `UI` component uses the JavaFx UI framework. The layout of these UI parts are defined in matching `.fxml` files that are in the `src/main/resources/view` folder. For example, the layout of the [`MainWindow`](https://github.com/se-edu/addressbook-level3/tree/master/src/main/java/seedu/address/ui/MainWindow.java) is specified in [`MainWindow.fxml`](https://github.com/se-edu/addressbook-level3/tree/master/src/main/resources/view/MainWindow.fxml)

<img src="images/johndoe.png" width="200px">
<box type="info" seamless>
Diagram of the UI component
</box>

The `UI` component,

* works with the `Logic` component in this way.
* works with the `Model` component in this way.
* works with the `Storage` component in this way.

### Logic component

<box type="info" seamless>

**Note:** The lifeline in the sequence diagram should end at the destroy marker (X) but due to a limitation of PlantUML, the lifeline reaches the end of diagram.
</box>

<img src="images/johndoe.png" width="200px">
<box type="info" seamless>
Diagram of the Logic component
</box>

The `Logic` component,

* works with the `UI` component in this way.
* works with the `Model` component in this way.
* works with the `Storage` component in this way.

### Model component

<img src="images/johndoe.png" width="200px">
<box type="info" seamless>
Diagram of the Model component
</box>

The `Model` component,

* works with the `UI` component in this way.
* works with the `Logic` component in this way.
* works with the `Storage` component in this way.

### Storage component

<img src="images/johndoe.png" width="200px">
<box type="info" seamless>
Diagram of the Storage component
</box>

The `Storage` component,

* works with the `UI` component in this way.
* works with the `Logic` component in this way.
* works with the `Model` component in this way.

--------------------------------------------------------------------------------------------------------------------

## **Implementation**

This section describes some noteworthy details on how certain features are implemented.

### \[Proposed\] FeatureX

#### Proposed Implementation

_{Explain here how the feature will be implemented}_

Given below is an example usage scenario and how FeatureX behaves at each step.

1. **Step 1**: User does something

   * **Expected**: FeatureX does something in response

1. **Step 2**: User does something else
   
      * **Expected**: FeatureX does something else in response

#### Design considerations:

**Aspect: How FeatureX executes:**

* **Alternative 1 (current choice):** Implementation 1
  * Pros: Easy to implement.
  * Cons: May have performance issues in terms of memory usage.

* **Alternative 2:** Implementation 2
  * Pros: Will use less memory.
  * Cons: We must add addtional test cases.

_{more aspects and alternatives to be added}_

### \[Proposed\] Data archiving

_{Explain here how the data archiving feature will be implemented}_


--------------------------------------------------------------------------------------------------------------------

## **Project Guides**

* [Documentation guide](Documentation.md)
* [Testing guide](Testing.md)
* [Logging guide](Logging.md)
* [Configuration guide](Configuration.md)
* [DevOps guide](DevOps.md)

--------------------------------------------------------------------------------------------------------------------

## **Appendix: Requirements**

### Product scope

**Target user profile**:

* user needs
* user preferences
* user information

**Value proposition**: Benefit compared to other similar products


### User stories

Priorities: High (must have) - `* * *`, Medium (nice to have) - `* *`, Low (unlikely to have) - `*`

| Priority | As a …​                                    | I want to …​                 | So that I can…​                                                        |
|----------|--------------------------------------------|------------------------------|------------------------------------------------------------------------|
| `* * *`  | new user                                   | see something       | visualise something                 |
| `* *`    | user                                       | do something | complete something                |
| `*`      | user with specific information | sort something         | find something                                                 |

*{More to be added}*

### Use cases

(For all use cases below, the **System** is the `ProjectEx` and the **Actor** is the `User`, unless specified otherwise)

**Use case: Do something**

**MSS**

1.  User requests ProjectEx
2.  ProjectEx provides response

    Use case ends.

**Extensions**

* 2a. Requests fails.

  Use case ends.

* 3a. User request is invalid.

    * 3a1. ProjectEx shows an error message.

      Use case resumes at step 2.

*{More to be added}*

### Non-Functional Requirements

1.  Should work on any _mainstream OS_ as long as it has Java `11` or above installed.
2.  Should be able to hold up to 1000 persons without a noticeable sluggishness in performance for typical usage.

*{More to be added}*

### Glossary

<box type="tip" seamless>

**Tip:**
This section can be used to define technical terms or concepts that are specific to the project.
</box>

* **Mainstream OS**: Windows, Linux, Unix, OS-X

--------------------------------------------------------------------------------------------------------------------

## **Appendix: Instructions for manual testing**

Given below are instructions to test the app manually.

<box type="info" seamless>

**Note:** These instructions only provide a starting point for testers to work on;
testers are expected to do more *exploratory* testing.

</box>

### Launch and shutdown

1. Initial launch

   1. How to download the app

   1. How to run the app

1. Shutdown

   1. On close attempt, prompt to confirm closing will pop up

   1. Click confirm to close app

1. _{ more test cases …​ }_

### Feature X

1. Using Feature X

   1. Prerequisites to use feature.

   1. Test case: Do something with feature X
      Expected: Visual output or change after test.

   1. Test case: Do something else with feature X
      Expected: Error pops up.

1. _{ more test cases …​ }_

### Saving data

1. Dealing with missing/corrupted data files

   1. _{explain how to simulate a missing/corrupted file, and the expected behavior}_

1. _{ more test cases …​ }_
