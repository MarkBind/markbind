{% from "userGuide/components/advanced.md" import slot_info_trigger %}

## Scroll To Top Button

<div id="content">

The ```scroll-top-button``` component allows users to move to the top of the page.

****Adding a scroll-top-button****

Add ```<scroll-top-button><scroll-top-button/>``` to layout file.

****Options****

| Name     | Type     | Default                 | Description                                                                           |
|----------|----------|-------------------------|---------------------------------------------------------------------------------------|
| icon     | `String` | `fa fa-arrow-circle-up` | Icon used for button.                                                                 |
| iconSize | `String` | ``                      | Size of button. Supports integer-scaling of the icon dimensions e.g. 2x, 3x, 4x, etc. |
| bottom   | `String` | `2%`                    | Distance from bottom edge of page.                                                    |
| right    | `String` | `2%`                    | Distance from right edge of page.                                                     |

</div>

<div id="short">

```html
<scroll-top-button
    icon="fa fa-arrow-circle-up"
    iconSize="2x"
    bottom="2%"
    right="2%"
></scroll-top-button>
```
</div>

<div id="examples" class="d-none">

You can see an example of a scroll to top button on the ==on the bottom right side== of <a target="_blank" href="{{ baseUrl }}/userGuide/formattingContents.html">this page</a>.
</div>
