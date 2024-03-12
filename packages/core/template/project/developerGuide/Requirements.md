---
  layout: default.md
  title: "Requirements"
  pageNav: 3
---

# Requirements

<box type="tip">
This section can be used to describe the requirements of the app, through the use of user stories, use cases.
</box>

### Product scope

**Target user profile**:

* user needs
* user preferences
* user information

**Value proposition**: Benefit compared to other similar products

**Non-Functional Requirements**:

* OS requirements
* Peformance
* Security

### User stories

Priorities: High (must have) - `* * *`, Medium (nice to have) - `* *`, Low (unlikely to have) - `*`

| Priority | As a …​                         | I want to …​    | So that I can…​      |
|----------|--------------------------------|----------------|---------------------|
| `* * *`  | new user                       | see something  | visualise something |
| `* *`    | user                           | do something   | complete something  |
| `*`      | user with specific information | sort something | find something      |

*{More to be added}*

### Use cases

(For all use cases below, the **System** is the `ProjectEx` and the **Actor** is the `User`, unless specified otherwise)

<panel header="**Use case 1: Do something**">
 
**MSS**

1.  User requests ProjectEx
1.  ProjectEx provides response

    Use case ends.

**Extensions**

* 2a. Requests fails.

  Use case ends.

* 2b. User request is invalid.

    * 2b1. ProjectEx shows an error message.

      Use case resumes at step 2.
</panel>
<br>

*{More to be added}*

### Non-Functional Requirements

1.  Should work on any _mainstream OS_ as long as it has Java `11` or above installed.
2.  Should be able to hold up to 1000 persons without a noticeable sluggishness in performance for typical usage.

*{More to be added}*
