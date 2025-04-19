{% from "userGuide/components/advanced.md" import slot_info_trigger %}

## Card Stack
The Card Stack component allows you to display a collection of information in the form of a cards layout. The `cardstack` component acts as the container for  `card` components each containing the content you want to show.

A `cardstack` component is used in conjunction with one or more `card` components.
- `cardstack`: Wrapper used to hold cards and their content.
- `card`: Card contains the information to display.

Each `card` contains `tag` and `keyword` field:
- `Keywords`: Adds to the search space but does not allow users to filter them manually. Add keywords when the content have different known aliases.
- `Tags`: Adds to the search space and also provides readers a way to filter the cards according to the selected tags. Add tags to categorise the content. 

<box type="info">

The search feature searches the `card` components of `cardstack` by header, tags and keywords specified within each card component. 

Specifying them can help improve searchability of the `cardstack` component!

For example, if a card is about "Machine Learning," you might tag it as `AI` and `Data Science` and add keywords like `ML` and `Artificial Intelligence` to improve searchability.
</box>

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cardstack searchable>
  <card header="**Winston Churchill**" tag="Success, Perseverance">
    Success is not final, failure is not fatal: it is the courage to continue that counts
  </card>
  <card header="**Albert Einstein**" tag="Success, Perseverance">
    In the middle of every difficulty lies opportunity
  </card>
  <card header="**Theodore Roosevelt**" tag="Motivation, Hard Work">
    Do what you can, with what you have, where you are
  </card>
  <card header="**Steve Jobs**" tag="Happiness, Mindset">
    Your time is limited, so don’t waste it living someone else’s life
  </card>
</cardstack>
</variable>
<variable name="output">
<cardstack searchable>
  <card header="**Winston Churchill**" tag="Success, Perseverance">
    Success is not final, failure is not fatal: it is the courage to continue that counts
  </card>
  <card header="**Albert Einstein**" tag="Success, Perseverance">
    In the middle of every difficulty lies opportunity
  </card>
  <card header="**Theodore Roosevelt**" tag="Motivation, Hard Work">
    Do what you can, with what you have, where you are
  </card>
  <card header="**Steve Jobs**" tag="Happiness, Mindset">
    Your time is limited, so don’t waste it living someone else’s life
  </card>
</cardstack>
</variable>
</include>

As shown in the above example,
- a `card` can be given a `header` attribute (optional).
- tags can be added to cards using the `tag` attribute, which can then be used to filter cards.
- the `searchable` attribute can be used to make the Card Stack searchable based on tags and headers.

In the example given below, a Card Stack is used to show a list of questions and answers, by including `question` components inside `card` components.

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<cardstack searchable blocks="1">
  <card header="**Multiple Response Question**" tag="MRQ" keywords="Mutliple Response Question, Math, Algebra">
    <question type="checkbox" header="Which of the following is correct?" hint="Think out of the box! :fas-box:">
      <!-- Details of questions omitted. -->
    </question>
  </card>
  <card header="**Multiple Choice Question**" tag="MCQ" keywords="Mutliple Choice Question, Test cases, testing">
    <question type="mcq" header="Which of these **contradicts** the heuristics recommended when creating test cases with multiple inputs?">
      <!-- Details of questions omitted. -->
    </question>
  </card>
</cardstack>
</variable>
<variable name="output">
<cardstack searchable blocks="1">
  <card header="**Multiple Response Question**" tag="MRQ" keywords="Mutliple Response Question, Math, Algebra">
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

  <card header="**Multiple Choice Question**" tag="MCQ" keywords="Mutliple Choice Question, Test cases, testing">
    <question type="mcq" header="Which of these **contradicts** the heuristics recommended when creating test cases with multiple inputs?">
      <!-- Insert the reason for the option using the reason attribute -->
      <q-option reason="This option **does not contradict the heuristics recommended**. We need to figure out if a positive test case works!">
        Each valid test input should appear at least once in a test case that doesn’t have any invalid inputs.
      </q-option>
      <q-option>
        It is ok to combine valid values for different inputs.
      </q-option>
      <q-option>
        No more than one invalid test input should be in a given test case.
      </q-option>
      <!-- Use the 'correct' attribute to indicate an option as correct. -->
      <q-option correct>
        All invalid test inputs must be tested together.
        <!-- Optionally, you may use a reason slot instead of a reason attribute. -->
        <div slot="reason">
        If you test all invalid test inputs together, you will not know if each one of the invalid inputs are handled
        correctly by the SUT.
        This is because most SUTs return an error message upon encountering the first invalid input.
        </div>
      </q-option>
      <div slot="hint">
      How do you figure out which inputs are wrong? (or correct)
      </div>
    </question>
  </card>
</cardstack>
</variable>
</include>

The example above also illustrates how to use the `keywords` attribute to specify additional search terms for a card.

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
