## Question

**Question component consists of a question body, a hint and an answer.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <question>
    The question body. <md>:grey_question:</md>
    <div slot="hint">
      Question hint. <md>:crystal_ball:</md>
    </div>
    <div slot="answer">
      Question answer. <md>:pencil:</md>
    </div>
  </question>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<question>
  The question body. <md>:grey_question:</md>
  <div slot="hint">
    Question hint. <md>:crystal_ball:</md>
  </div>
  <div slot="answer">
    Question answer. <md>:pencil:</md>
  </div>
</question>
```
</tip-box>
<br>

**If you leave the hint and answer `<div>` blank, a default hint and answer will be provided instead.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <question>
    This question has no hint or answer.
    <div slot="hint"></div>
    <div slot="answer"></div>
  </question>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<question>
  This question has no hint or answer.
  <div slot="hint"></div>
  <div slot="answer"></div>
</question>
```
</tip-box>
<br>

**Use the `has-input` attribute to add a text input box for users to enter their answer.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <question has-input>
    What is the distance from Earth to the Moon in kilometers? (Give your answer in 3 s.f)
    <div slot="hint">It is between 300,000 and 400,000 km</div>
    <div slot="answer">384,000 km <md>:full_moon:</md></div>
  </question>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<question has-input>
  What is the distance from Earth to the Moon in kilometers? (Give your answer in 3 s.f)
  <div slot="hint">It is between 300,000 and 400,000 km</div>
  <div slot="answer">384,000 km <md>:full_moon:</md></div>
</question>
```
</tip-box>
<br>

**You are able to omit the hint or answer `<div>` independently, and they will not render.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <question>
    This question with an omitted hint.
    <div slot="answer">42 <md>:star:</md></div>
  </question>
</tip-box>

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <question>
    This question with an omitted answer.
    <div slot="hint">The number of exponent bits in a 64-bit Floating Point. <md>:computer:</md></div>
  </question>
</tip-box>

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <question>
    This question only has the question body. 
  </question>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<question>
  This question with an omitted hint.
  <div slot="answer">42 <md>:star:</md></div>
</question>

<question>
  This question with an omitted answer.
  <div slot="hint">The number of exponent bits in a 64-bit Floating Point. <md>:computer:</md></div>
</question>

<question>
  This question only has the question body. 
</question>
```
</tip-box>
<br>

**Use the minimized Panel component to create and group questions inline.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="Q1 :crown:" minimized>
    <question has-input>
      Who is the first king of Thailand?
    </question>
  </panel>
  <panel header="Q2 :pizza:" minimized>
    <question has-input>
      Which country did the Hawaiian pizza originate from? 
      <div slot="hint">
        Not Italy or Haiwaii <md>:smirk:</md>
      </div>
    </question>
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="Q1 :crown:" minimized>
  <question has-input>
    Who is the first king of Thailand?
  </question>
</panel>
<panel header="Q2 :pizza:" minimized>
  <question has-input>
    Which country did the Hawaiian pizza originate from? 
    <div slot="hint">
      Not Italy or Haiwaii <md>:smirk:</md>
    </div>
  </question>
</panel>
```
</tip-box>
<br>

**Questions can also be loaded in from another file using Panel's `src` attribute.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="Questions loaded in from `quiz.md`" src="anotherSrc/quiz.md"></panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="Questions loaded in from `quiz.md`" src="anotherSrc/quiz.md"></panel>
```
</tip-box>
<br>

#### Question Options
Name | Type | Default | Description
--- | --- | --- | ---
has-input | `Boolean` | `false` | Whether Question has a text input box.
