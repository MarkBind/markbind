{% from "userGuide/components/advanced.md" import slot_info_trigger %}

## Scroll To Top Button

<div id="content">

The ```scroll-top-button``` component allows users to move to the top of the page.

****Adding a scroll-top-button****

Add ```<scroll-top-button><scroll-top-button/>``` to layout file.

****Options****

| Name                      | Type     | Default                 | Description                                                                                   |
|---------------------------|----------|-------------------------|-----------------------------------------------------------------------------------------------|
| icon{{slot_info_trigger}} | `String` | `:fas-arrow-circle-up:` | Inline MarkDown text of the icon displayed on the left.                                       |
| icon-size                 | `String` | `null`                  | Resizes the icon. Supports integer-scaling of the icon dimensions e.g. `2x`, `3x`, `4x`, etc. |
| bottom                    | `String` | `2%`                    | Distance from bottom edge of page.                                                            |
| right                     | `String` | `2%`                    | Distance from right edge of page.                                                             |

</div>

<div id="short">

```html
<scroll-top-button
    icon=":fas-arrow-circle-up:"
    icon-size="2x"
    bottom="2%"
    right="2%"
></scroll-top-button>
```
</div>

<div id="examples" class="d-none">

You can see an example of a scroll to top button on the ==on the bottom right side== of this page.
</div>
