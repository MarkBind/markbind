# Code Blocks

## Basic Syntax Highlighting

````markdown
```js
const x = 42;
```

```python
print("Hello")
```

```html
<div>HTML</div>
```
````

## Line Numbers

````markdown
```js {.line-numbers}
const x = 42;
const y = 100;
```
````

## Custom Start Line

````markdown
```js {.line-numbers start-from=10}
const x = 42;
```
````

## Highlight Lines

````markdown
```js {highlight-lines="1,3-5"}
const a = 1;  // highlighted
const b = 2;
const c = 3;  // highlighted
const d = 4;  // highlighted
const e = 5;  // highlighted
```
````

## Heading on Code Block

````markdown
```js {heading="example.js"}
console.log("Hello");
```
````

## Inline Code with Syntax

```markdown
`const x = 42;`{.js}
```

## Code Block Options Reference

| Option | Syntax | Example |
|--------|--------|---------|
| Language | First line | ```js |
| Line numbers | `{.line-numbers}` | ```js {.line-numbers} |
| Start from | `start-from=N` | ```js {.line-numbers start-from=10} |
| Highlight lines | `highlight-lines="1,3-5"` | |
| Heading | `heading="title"` | |