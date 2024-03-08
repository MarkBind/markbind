{% from "userGuide/components/advanced.md" import slot_info_trigger, slot_type_info_trigger %}

## Questions and Quizzes

Question and quiz components provide an easy way to test readers on the relevant content topic in the page. {.mt-3}

#### Introduction

Question components (`<question>`) can be one of the following types: **MCQ**, **Checkbox**, **Fill-in-the-Blanks**,  or **Text**.

In all cases, content directly inserted in between `<question>...</question>` will be inserted into the **question body**.

You can also insert markdown into the **header** or **hint box**, by using the `header` and `hint` attributes respectively. Click the hint button below to see how the hint box turns out!

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="heading">Header and Hint syntax</variable>
<variable name="code">
<!-- Insert markdown into the header and hint using the respective attributes -->
<question type="checkbox" header="Which of the following is correct?" hint="Think out of the box! :fas-box:">

  <!-- Anything you place directly under a question not in a slot is inserted into the question body! -->
  <small>Adapted from [Daily Mail](https://www.dailymail.co.uk/femail/article-4702868/Can-pass-intelligence-test.html)
  </small>
  </pic>

  <!-- Several hidden checkbox q-option components explained later -->
</question>
</variable>
<variable name="output">
<question type="checkbox" header="Which of the following is correct?" hint="Think out of the box! :fas-box:">

  <pic src="{{baseUrl}}/images/math-question.jpg" alt="math question image" height="200" class="d-block mx-auto">

  <small>Adapted from [Daily Mail](https://www.dailymail.co.uk/femail/article-4702868/Can-pass-intelligence-test.html)
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
</variable>
</include>

If you require more expressive formatting for your header or hint markup, you can use the `<div slot="header">` and `<div slot="hint">` slots. Expand the panel below to see an example!

<panel type="minimal" header="Header and Hint example **with slots**">
<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="heading">Headers and Hints using slots</variable>
<variable name="code">
<question type="checkbox" header="Which of the following is true?" hint="Think out of the box! :fas-box:">
  <!-- Header slot -->
  <div slot="header">

  Which of the following is correct?

  Challenge: Try to get all the answers on your first try! :star: :star:
  </div>

  <pic src="{{baseUrl}}/images/math-question.jpg" alt="math question image" height="200" class="d-block mx-auto">

  <small>Adapted from [Daily Mail](https://www.dailymail.co.uk/femail/article-4702868/Can-pass-intelligence-test.html)
  </small>
  </pic>

  <!-- Several hidden checkbox q-option components explained later -->

  <!-- Hint slot -->
  <div slot="hint">

  Think out of the box! :fas-box:

  Need another hint? <tooltip content="Two of the answers are correct!">Hover over me!</tooltip> :fas-mouse-pointer:
  </div>
</question>
</variable>
<variable name="output">
<question type="checkbox" header="Which of the following is true?" hint="Think out of the box! :fas-box:">
  <!-- Header slot -->
  <div slot="header">

  Which of the following is correct?

  Challenge: Try to get all the answers on your first try! :star: :star:
  </div>

  <pic src="{{baseUrl}}/images/math-question.jpg" alt="math question image" height="200" class="d-block mx-auto">

  <small>Adapted from [Daily Mail](https://www.dailymail.co.uk/femail/article-4702868/Can-pass-intelligence-test.html)
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

  <!-- Hint slot -->
  <div slot="hint">

  Think out of the box! :fas-box:

  Need another hint? <tooltip content="Two of the answers are correct!">Hover over me!</tooltip> :fas-mouse-pointer:
  </div>
</question>
</variable>
</include>
</panel>

<box type="tip" seamless class="mt-3">

Placing the question into the header is entirely optional. You may also wish to include the question directly in the question body, omitting the header entirely.
</box>


****Options and Slots common to all question types****
Name | Type | Default | Description
--- | --- | --- | ---
type | `String` | `''` | The type of question. Supports `mcq`, `checkbox`, `blanks`, or `text`.
header{{slot_info_trigger}} | `String` | `''` | The markup to insert into the question header. The header is omitted if this is not provided.
hint{{slot_info_trigger}}  | `String` | `''` | The content to display in the hint box.


#### MCQ and Checkbox Questions {.mt-4 .mb-3}

MCQ and checkbox questions are indicated with the `type="mcq"` or `type="checkbox"` attribute.

In both instances, you can include the possible answers using the `<q-option>` component, placed anywhere inside the <tooltip content="if you wish, you could place it in the `header` mentioned above as well!">question</tooltip>. To indicate the correct option(s), add the `<q-option correct>` attribute.

Optionally, you can provide the reason for the particular option using the `<q-option reason="...">` attribute, or the `<div slot="reason">` slot for more expressive formatting, similar to the `hint` and `header` options and slots.

**MCQ Questions**

{% set mcqQuestion %}
<question type="mcq" header="Which of these **contradicts** the heuristics recommended when creating test cases with multiple inputs?">
  <!-- Insert the reason for the option using the reason attribute -->
  <q-option reason="This is **correct**. We need to figure out if a positive test case works!">
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
{% endset %}

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">{{ mcqQuestion }}</variable>
</include>

<box type="tip" seamless>MCQ questions can have multiple correct options!</box>

**Checkbox Questions**

{% set checkboxQuestion %}
<question type="checkbox" hint="Use your calculator! :fas-calculator:">

  ###### Which of the following is true?

  <br>
  <q-option reason="lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum">
    1 + 1 = 11
  </q-option>
  <q-option reason="Division by zero is **undefined**!">
    1 / 0 = infinity
  </q-option>
  <q-option correct>
  11 / 11 = 1
  </q-option>
</question>
{% endset %}

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">html</variable>
<variable name="code">{{ checkboxQuestion }}</variable>
</include>

****`q-option` Options and Slots****
Name | Type | Default | Description
--- | --- | --- | ---
correct | `Boolean` | `false` | Whether this option (placed under either a MCQ or checkbox question) is correct. You may have multiple correct answers in either case.
reason{{slot_info_trigger}}  | `String` | `''` | The explanation markup to display for the option once the answer is checked.


#### Fill-in-the-Blanks Questions {.mt-4 .mb-3}

Fill-in-the-blanks questions are specified with the `type="blanks"` attribute.

Unlike MCQ and checkbox questions, answer checking is performed for each blank by providing keywords to check for in the user's answer through the `keywords` attribute in each `q-option`.
If no keywords are provided, the answer for that blank will always be marked as correct.

<box type="warning" seamless>

Keywords are validated by checking if the keyword matches the user's answer exactly (ignoring letter casing).
This works well for some
<popover header="When does validation work?">cases
  <span slot="content">
  When the keywords given are short and specific to the blank (eg. `abstraction`), it increases the chances that the blank will be validated correctly.
  <br><br>
  In contrast, something long and vague like `after discussing for a period of time` which can easily be expressed in a different way (eg. `after deliberating for a while`) would likely cause the blank to be validated incorrectly.
  </span>
</popover>
and not others.

</box>

{% set blanksQuestion %}
<question type="blanks" hint="Google it!">

  ###### German sociologist __________ called the process of simultaneously analyzing the behavior of individuals and the society that shapes that behavior __________.

  <q-option keywords="Norbert Elias, Elias" reason="That's his name!"></q-option>
  <q-option keywords="figuration"></q-option>
</question>
{% endset %}

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">html</variable>
<variable name="code">{{ blanksQuestion }}</variable>
</include>

By default, if the question has yet to be answered correctly, intermediate results will be shown beside each blank. You can specify a `no-intermediate-result` attribute to avoid this behvaiour (i.e. hide the result of each blank upon incorrect attempts).

<box type="tip" seamless>

Since the validation is imperfect, the minimum proportion of correct blanks needed for the entire question to be marked as correct can also be changed using the `threshold` attribute.

If you don't want to validate the answer at all, you may set the `threshold` attribute to `0`. Doing so always marks the entire question correct, and users will be able to see all intended answers.

</box>

{% set blanksQuestion2 %}
<question type="blanks" hint="What properties would you want these database transactions to have?" threshold=0.75 no-intermediate-result>

  ###### In computer science, ACID is a set of properties of database transactions intended to guarantee data validity despite errors, power failures, and other mishaps. These properties are: A for __________, C for __________, I for __________, and D for __________.

  <q-option keywords="Atomicity, Atomic" reason="Meaning: either all occurs or nothing occurs"></q-option>
  <q-option keywords="Consistency, Consistent"></q-option>
  <q-option keywords="Isolation, Isolated"></q-option>
  <q-option keywords="Durability, Durable"></q-option>
</question>
{% endset %}

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">html</variable>
<variable name="code">{{ blanksQuestion2 }}</variable>
</include>

****Fill-in-the-Blanks Question specific Options and Slots****
Name | Type | Default | Description
--- | --- | --- | ---
threshold | `Number` | `0.5` | Minimum proportion of keywords that have to be matched in the user's answer for the answer to be marked as correct.
no-intermediate-result | `Boolean` | `False` | Hides the result of each blank after an incorrect attempt.

****`q-option` Options and Slots****
Name | Type | Default | Description
--- | --- | --- | ---
keywords | `String` | `''` | Comma delimited string of keywords or phrases to match the user's answer against.
reason{{slot_info_trigger}}  | `String` | `''` | The explanation markup to display for the option once the answer is checked.


#### Text Questions {.mt-4 .mb-3}

Text questions are specified with the `type="text"` attribute.

Unlike MCQ and checkbox questions, answer checking is performed by providing keywords to check for in the user's answer through the `keywords` attribute.
If no keywords are provided, the answer will always be marked as correct when placed in quizzes.

<box type="warning" seamless>

Keywords are validated by simply looking for the keyword as a pattern in the user's answer!
This works well for some
<popover header="When does validation work?">cases
  <span slot="content">
  When the keywords specified are rather long (eg. `requirements`), it reduces the chance that this keyword can be mistakenly validated.
  <br><br>
  In contrast, something short and common like `take` which can easily be part of another word (eg. `mis-take-nly`) would be mistakenly validated.
  </span>
</popover>
and not others.

</box>

You can provide your answer in the `answer` attribute, or similarly, the `<div slot="answer">` slot for more expressive formatting.

{% set textQuestion %}
<question type="text" header="Which country did the Hawaiian pizza originate from?"
          keywords="hawaii" threshold="0.5" answer="It originated from Hawaii!">
  <div slot="hint">

  Watch some pizza commercials! :tv:

  :pizza: :pizza: :pizza: :pizza: :pizza: :pizza: :pizza: :pizza: :pizza: :pizza: :pizza: :pizza:
  </div>
</question>
{% endset %}

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">html</variable>
<variable name="code">{{ textQuestion }}</variable>
</include>

<box type="tip" seamless>

Since the validation is imperfect, the minimum proportion of keywords that need to be matched can also be changed using the `threshold` attribute.

If you don't want to validate the answer at all, you may also omit the `keywords` attribute entirely. Doing so also always marks the question as correct inside [quizzes](#quizzes).

</box>

****Text Question specific Options and Slots****
Name | Type | Default | Description
--- | --- | --- | ---
keywords | `String` | `''` | Comma delimited string of keywords or phrases to match the user's answer against.
threshold | `Number` | `0.5` | Minimum proportion of keywords that have to be matched in the user's answer for the answer to be marked as correct.
answer{{slot_info_trigger}} | `String` | `''` | The answer or explanation to display when the user clicks the check button.

#### Quizzes

You can also build a series of questions out of multiple `<question>` components.

Simply place the `<question>` components you want to include into the `<quiz>` component! No extra configuration is needed.

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<quiz>
  <question type="mcq">...</question>
  <question type="checkbox">...</question>
  <question type="blanks">...</question>
  <question type="text">...</question>
</quiz>
</variable>
<variable name="output">
<quiz>
{{ mcqQuestion }}
{{ checkboxQuestion }}
{{ blanksQuestion }}
{{ textQuestion }}
</quiz>
</variable>
</include>

<br>

****Quiz Options and Slots****
Name | Type | Default | Description
--- | --- | --- | ---
intro | `String` | `''` | Quiz intro markup above the question count.
intro | Slot | `Click start to begin` | Quiz intro markup. Overrides the `intro` attribute if both are present.

<!-- Included in syntax cheat sheet -->
<div id="short" class="d-none">

```html { heading="MCQ and Checkbox questions" }
<!-- use type="checkbox" for checkbox questions -->
{{ mcqQuestion }}
```

```html { heading="Fill-in-the-Blanks questions" }
{{ blanksQuestion }}
```

```html { heading="Text questions" }
{{ textQuestion }}
```

```html { heading="Quiz" }
<quiz>
  <question type="mcq">...</question>
  <question type="checkbox">...</question>
  <question type="blanks">...</question>
  <question type="text">...</question>
</quiz>
```
</div>

<!-- Included in readerFacingFeatures.md -->
<div id="examples" class="d-none">
<quiz>
{{ mcqQuestion }}
{{ checkboxQuestion }}
{{ blanksQuestion }}
{{ textQuestion }}
</quiz>
</div>
