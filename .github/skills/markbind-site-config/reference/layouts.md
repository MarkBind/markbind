# Layouts

## Location and Usage

- Put layout files in `_markbind/layouts/`.
- Render page body with `{{ content }}`.
- Select layout via frontmatter `layout` or `site.json` page config.

## Layout Special Tags

- `<head-top>`: inject at top of HTML `<head>`
- `<head-bottom>`: inject after MarkBind assets in `<head>`
- `<script-bottom>`: inject after page body and MarkBind scripts

## Sticky Header

Use `sticky` on `<header>` to enable MarkBind sticky-header behavior and anchor offset support.

## User Guide Source

- <https://markbind.org/userGuide/tweakingThePageStructure.html#layouts>
