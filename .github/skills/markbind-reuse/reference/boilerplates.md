# Boilerplates

## Purpose

Use boilerplates for reusable content that must be interpreted relative to where it is applied (not where the template file is stored).

## Location

Store boilerplate templates in `_markbind/boilerplates/`.

## Basic Usage

```html
<include src="chapter1/chapter.md" boilerplate />
<include src="chapter2/chapter.md" boilerplate />
```

MarkBind resolves the source template from `_markbind/boilerplates/` and applies it relative to each include target path.

## Boilerplate in Subfolders

```html
<include src="chapter1/chapter.md" boilerplate="book/chapter.md" />
<include src="chapter2/chapter.md" boilerplate="book/chapter.md" />
```

## With Variables

```html
<include src="tip.md" boilerplate>
  <span id="tip_body">Always save your work frequently.</span>
</include>
```

## User Guide Source

- <https://markbind.org/userGuide/reusingContents.html>
