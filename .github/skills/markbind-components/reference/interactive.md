# Interactive Components

## Questions and Quizzes

**Question** components provide assessment capabilities with multiple types.

### Question Types

| Type | Purpose |
|------|---------|
| `mcq` | Multiple choice single answer |
| `checkbox` | Multiple choice multiple answers |
| `blanks` | Fill-in-the-blanks |
| `text` | Free-text response |

### MCQ Question

```html
<question type="mcq" header="What is 2+2?">
  <q-option>3</q-option>
  <q-option correct>4</q-option>
  <q-option>5</q-option>
  <span slot="hint">Think basic arithmetic</span>
</question>
```

### Checkbox Question

```html
<question type="checkbox" header="Select all primes">
  <q-option correct>2</q-option>
  <q-option>4</q-option>
  <q-option correct>7</q-option>
  <q-option>9</q-option>
</question>
```

### Fill-in-the-Blanks

```html
<question type="blanks" header="Complete: HTML stands for ____">
  <q-option keywords="HyperText Markup Language">HyperText Markup Language</q-option>
</question>
```

### Text Question

```html
<question type="text" header="What is your name?" answer="John" keywords="john,JOHN">
</question>
```

### Q-Option Attributes

| Attribute | Description |
|-----------|-------------|
| `correct` | Mark as correct answer |
| `reason` | Explanation shown after answer |

### Header and Hint

```html
<question type="mcq" header="Question text" hint="Hint text">
  <q-option>Option A</q-option>
  <q-option correct>Option B</q-option>
</question>
```

Or use slots for rich content:
```html
<question type="mcq">
  <div slot="header">
    **Bold** header text
  </div>
  <div slot="hint">
    Rich *markdown* hint
  </div>
  ...
</question>
```

### Quiz (Multiple Questions)

```html
<quiz>
  <span slot="intro">Test your knowledge!</span>
  <question type="mcq" header="Q1: What is 2+2?">
    <q-option>3</q-option>
    <q-option correct>4</q-option>
  </question>
  <question type="text" header="Q2: Name the capital of France" answer="Paris" keywords="paris">
  </question>
</quiz>
```

### No Page Break

```html
<question type="mcq" header="Question" no-page-break>
  ...
</question>
```

### Question Options

| Name | Type | Description |
|------|------|-------------|
| `type` | String | `mcq`, `checkbox`, `blanks`, `text` |
| `header` | slot | Question header |
| `hint` | slot | Hint text |
| `no-page-break` | Boolean | Keep on one printed page |

### Q-Option Options

| Name | Type | Description |
|------|------|-------------|
| `correct` | Boolean | Mark as correct |
| `reason` | slot | Explanation |
| `keywords` | String | For blanks/text validation |

---

## Search Bar

**Searchbar** provides site-wide heading search.

```html
<searchbar :data="searchData" placeholder="Search the site" :on-hit="searchCallback"></searchbar>
```

Requires `enableSearch: true` in `site.json`.

### Options
| Name | Type | Description |
|------|------|-------------|
| `:data` | String | Set to `"searchData"` |
| `:on-hit` | String | Set to `"searchCallback"` |
| `placeholder` | String | Placeholder text |
| `menu-align-right` | Boolean | Right-align dropdown |
| `algolia` | Boolean | Use Algolia DocSearch |