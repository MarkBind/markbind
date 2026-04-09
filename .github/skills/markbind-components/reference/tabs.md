# Tabs

**Tabs** organize content into tabbed interfaces.

## Basic Tabs

```html
<tabs>
  <tab header="First tab">
    Text in the first tab
    <markdown>_some markdown_</markdown>
  </tab>
  <tab header="Second tab">
    Content of the second tab
  </tab>
</tabs>
```

## Active Tab

```html
<tabs :active="1">
  <tab header="First tab">First content</tab>
  <tab header="Second tab">Second content (active by default)</tab>
</tabs>
```

## Disabled Tabs

```html
<tabs>
  <tab header="Active tab">Content</tab>
  <tab header="Disabled tab" disabled>
    This tab cannot be clicked
  </tab>
</tabs>
```

## Tab Groups

```html
<tabs>
  <tab-group header="Programming Languages">
    <tab header="JavaScript">
      JS content here
    </tab>
    <tab header="Python">
      Python content here
    </tab>
  </tab-group>
  <tab-group header="Databases">
    <tab header="SQL">
      SQL content
    </tab>
    <tab header="NoSQL">
      NoSQL content
    </tab>
  </tab-group>
</tabs>
```

## Disabled Tab Group

```html
<tabs>
  <tab header="Active Tab">Content</tab>
  <tab-group header="Disabled Group" disabled>
    <tab header="Hidden tab">
      Cannot access this group
    </tab>
  </tab-group>
</tabs>
```

## Hide from Print

```html
<tabs>
  <tab header="Visible in Print">This shows in print</tab>
  <tab header="Not Printed" class="d-print-none">
    This tab will not be printed.
  </tab>
</tabs>
```

## Options

### `tabs` Component
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `active` | Number | 0 | Active Tab index (0-based) |

### `tab` Component
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `header` | String | null | Tab title. Supports Markdown |
| `disabled` | Boolean | false | Whether Tab is clickable |

### `tab-group` Component
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `header` | String | null | Tab Group title. Supports Markdown |
| `disabled` | Boolean | false | Whether Tab Group is clickable |