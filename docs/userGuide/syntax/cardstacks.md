{% from "userGuide/components/advanced.md" import slot_info_trigger %}

## Card Stack
The Card Stack component allows you to display multiple cards in a structured layout with an optional search functionality. Each card supports various types of content, such as text, images as well as Markbind components.

A `cardstack` component is used in conjunction with one or more `card` components.
- `cardstack`: Wrapper used to hold cards and their content.
- `card`: Card contains the information to display.

Each `card` contains `tag` and `keyword` field:
- `Keywords`: Adds to the search space but does not allow users to filter them manually. 
- `Tags`: Adds to the search space and also provides readers a way to filter the cards according to the selected tags.  

<box type="info">

The search feature searches the `card` components of the `cardstack` by header, tags and keywords specified within each card component. 

Specifing them can help improve searchability of your `cardstack` component!
</box>

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cardstack searchable blocks="2">
  <card header="**Card Content** 🚀 _with inline markdown_" tag="Card 1" keywords="example">
    This is a basic card with a trigger.<br>
    Click on this <trigger for="modal:info" trigger="click">trigger</trigger>.
    <modal header="Modal Example" id="modal:info">
      <md>You have triggered a modal! 🎉</md>
    </modal>
  </card>
  <card header="**Card Title**" tag="Card 2" keywords="">
    Supporting text content.
  </card>
  <card header="**Card containing code**" tag="Code" keywords="Card">

    ```
    public static void main(String[] args) {
      print('Hello world!');
    }
    ```
  </card>
    <card header="Card with Image" keywords="AND, XOR, gate" tag="Image, Circuit">
    <annotate src="../../images/annotateSampleImage.png" height="150" alt="Circuit diagram">
      <a-point x="2%" y="13%" content="This is input A" header="Point A"  opacity="0.2" size="20"/>
    </annotate>
  </card>
</cardstack>
</variable>

<variable name="output">
<cardstack searchable blocks="2">
  <card header="**Card Content** 🚀 _with inline markdown_" tag="Card 1" keywords="example">
    This is a basic card with a trigger.<br>
    Click on this <trigger for="modal:info" trigger="click">trigger</trigger>.
    <modal header="Modal Example" id="modal:info">
      <md>You have triggered a modal! 🎉</md>
    </modal>
  </card>
  <card header="**Card Title**" tag="Card 2" keywords="">
    Supporting text content.
  </card>
  <card header="**Card containing code**" tag="Code" keywords="Card">

  ```
  public static void main(String[] args) {
    print('Hello world!');
  }
  ```
  </card>
    <card header="Card with Image" keywords="AND, XOR, gate" tag="Image, Circuit">
    <annotate src="../../images/annotateSampleImage.png" height="150" alt="Circuit diagram">
      <a-point x="2%" y="13%" content="This is input A" header="Point A"  opacity="0.2" size="20"/>
    </annotate>
  </card>
</cardstack>
</variable>
</include>

****Options****

`cardstack`:
Name | Type | Default | Description
--- | --- | --- | ---
blocks | `String` | `2` | Number of `card` columns per row.<br> Supports: `1`, `2`, `3`, `4`, `6`
searchable | `Boolean` | `false` | Whether the card stack is searchable.

`card`:
Name | Type | Default | Description
--- | --- | --- | ---
tag | `String` | `null` | Tags of each card component.<br>Each unique tag should be seperated by a `,`.<br> Tags are added to the search field.
header | `String` | `null` | Header of each card component.<br> Supports the use of inline markdown elements.
keywords | `String` | `null` | Keywords of each card component.<br>Each unique keyword should be seperated by a `,`.<br> Keywords are added to the search field.
disable | `Boolean` | `false` | Disable card. <br> This removes visibility of the card and makes it unsearchable. 



<div id="short" class="d-none">

```html
<cardstack searchable blocks="2">
    <card header="**Basic Card** :rocket:" tag="Basic Card" keywords="Basic">
        This is a basic card.<br>
        Click on this <trigger for="modal:triggerBait" trigger="click">trigger!</trigger>.
        <modal header="**You clicked on a Trigger!** :rocket:" id="modal:triggerBait">
          <md>You have just triggered a modal controlled by a trigger called trigger! :rofl:</md>
        </modal>
    </card>
    <card header="A *markdown* header" tag="Markdown, header, Cool" keywords="">
        You can apply markdown to headers and body elements!
        <box type="warning">
        <md>>**Like** *this* [cool](#cardstacks) `text` :cool:</md>
        </box>
    </card>
    <card header="Card with Image" keywords="Super duper cool" tag="Image, Cool">
      <annotate src="../../images/annotateSampleImage.png" height="500" alt="Sample Image">
        <a-point x="2%" y="13%" content="I am annotated" header="Annotated point"  opacity="0.2" size="20"/>
      </annotate>
    </card>
    <card header="Disabled card" tag="Disabled" keywords="Disabled" disabled>
      This card is disabled and will not show
    </card>
    <card header="An **interesting** question" tag="Question, Markdown" keywords="">
      <question type="checkbox" header="Which of the following is correct?" hint="Think out of the box! :fas-box:">
        <pic src="{{baseUrl}}/images/math-question.jpg" alt="math question image" height="200" class="d-block mx-auto">
        <small><md>Adapted from [Daily Mail](https://www.dailymail.co.uk/femail/article-4702868/Can-pass-intelligence-test.html)</md>
        </small>
        </pic>
        <q-option correct reason="Multiply the numbers on the left together and add the leftmost number!">
          96
        </q-option>
        <q-option reason="Under normal circumstances, this would be correct.">
          19
        </q-option>
        <q-option correct reason="Simply add the running sum of the results as well!">
          40
        </q-option>
        <q-option>
          811
        </q-option>
      </question>
    </card>
</cardstack>
```
</div>

<div id="examples" class="d-none">

<cardstack searchable blocks="2">
    <card header="**Basic Card** :rocket:" tag="Basic Card" keywords="Basic">
        This is a basic card.<br>
        Click on this <trigger for="modal:triggerBait" trigger="click">trigger!</trigger>.
        <modal header="**You clicked on a Trigger!** :rocket:" id="modal:triggerBait">
          <md>You have just triggered a modal controlled by a trigger called trigger! :rofl:</md>
        </modal>
    </card>
    <card header="A *markdown* header" tag="Markdown, header, Cool" keywords="">
        You can apply markdown to headers and body elements!
        <box type="warning">
        <md>>**Like** *this* [cool](#cardstacks) `text` :cool:</md>
        </box>
    </card>
    <card header="Card with Image" keywords="Super duper cool" tag="Image, Cool">
      <annotate src="../../images/annotateSampleImage.png" height="500" alt="Sample Image">
        <a-point x="2%" y="13%" content="I am annotated" header="Annotated point"  opacity="0.2" size="20"/>
      </annotate>
    </card>
    <card header="Disabled card" tag="Disabled" keywords="Disabled" disabled>
      This card is disabled and will not show
    </card>
    <card header="An **interesting** question" tag="Question, Markdown" keywords="">
      <question type="checkbox" header="Which of the following is correct?" hint="Think out of the box! :fas-box:">
        <pic src="{{baseUrl}}/images/math-question.jpg" alt="math question image" height="200" class="d-block mx-auto">
        <small><md>Adapted from [Daily Mail](https://www.dailymail.co.uk/femail/article-4702868/Can-pass-intelligence-test.html)</md>
        </small>
        </pic>
        <q-option correct reason="Multiply the numbers on the left together and add the leftmost number!">
          96
        </q-option>
        <q-option reason="Under normal circumstances, this would be correct.">
          19
        </q-option>
        <q-option correct reason="Simply add the running sum of the results as well!">
          40
        </q-option>
        <q-option>
          811
        </q-option>
      </question>
    </card>
</cardstack>
</div>
