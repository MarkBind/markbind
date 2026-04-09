# Card Stack

The **Card Stack** component displays a collection of information in a card layout with filtering and search capabilities.

## Basic Card Stack

```html
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
    Your time is limited, so don't waste it living someone else's life
  </card>
</cardstack>
```

- `header`: Optional card header (supports Markdown)
- `tag`: Comma-separated tags for filtering
- `searchable`: Enable search by header, tags, and keywords
- `keywords`: Additional search terms (different from tags)

## Column Layout

```html
<cardstack blocks="1">...</cardstack>
<cardstack blocks="2">...</cardstack>  <!-- default -->
<cardstack blocks="3">...</cardstack>
<cardstack blocks="4">...</cardstack>
<cardstack blocks="6">...</cardstack>
```

## Custom Tag Colors and Order

```html
<cardstack searchable>
  <tags>
    <tag name="Success" color="#28a745" />
    <tag name="Perseverance" color="#17a2b8" />
    <tag name="Motivation" color="#ffc107" />
    <tag name="Hard Work" color="#dc3545" />
    <tag name="Happiness" color="#6f42c1" />
    <tag name="Mindset" color="#fd7e14" />
  </tags>
  <card header="**Winston Churchill**" tag="Success, Perseverance">
    ...
  </card>
  ...
</cardstack>
```

Supports hex colors (e.g., `#28a745`) or Bootstrap color names (`success`, `danger`, `primary`, `warning`, `info`, `secondary`, `light`, `dark`).

## Disable Tag Counts

```html
<cardstack searchable disable-tag-count>
  <card header="Card 1" tag="Tag1">...</card>
  <card header="Card 2" tag="Tag2">...</card>
</cardstack>
```

## Disabled Cards

```html
<card header="Disabled card" tag="Disabled" disabled>
  This card is hidden and unsearchable
</card>
```

## Questions in Cards

```html
<cardstack searchable blocks="1">
  <card header="**Multiple Choice Question**" tag="MCQ" keywords="Test cases">
    <question type="mcq" header="Which option is correct?">
      <q-option correct>Correct answer</q-option>
      <q-option>Wrong answer</q-option>
    </question>
  </card>
</cardstack>
```

## Options

### `cardstack`
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `blocks` | String | `2` | Columns per row: `1`, `2`, `3`, `4`, `6` |
| `searchable` | Boolean | false | Enable search |
| `show-select-all` | Boolean | true | Show select all button |
| `disable-tag-count` | Boolean | false | Hide tag count badges |

### `tags` (container inside cardstack)
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | String | Yes | Tag name (must match cards) |
| `color` | String | No | Hex or Bootstrap color name |

### `card`
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `header` | String | null | Card header (supports Markdown) |
| `tag` | String | null | Comma-separated tags |
| `keywords` | String | null | Additional search terms |
| `disabled` | Boolean | false | Hide card |