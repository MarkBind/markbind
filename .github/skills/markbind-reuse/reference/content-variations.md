# Content Variations

## Closeable Optional Content

```html
<div v-closeable>
  Optional video:
  @[youtube](videoId)
</div>
```

## Alternative Content with Tabs

```html
<tabs>
  <tab header="For Beginners">Beginner explanation</tab>
  <tab header="For Experts">Advanced explanation</tab>
</tabs>
```

## Variants with Tags

```html
<div tags="environment--ug">User-only content</div>
<div tags="environment--ug environment--dev">Shared content</div>
```

## Hidden Content

Use `d-none` or page-specific CSS classes to hide fragments.

## Print Optimization

- Minimized panels auto-hide in print view.
- Use `no-page-break` on components that should stay together.

```html
<box type="info" no-page-break>
  Important info that should not split across pages
</box>
```

## User Guide Source

- <https://markbind.org/userGuide/reusingContents.html>
