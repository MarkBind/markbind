{% from "userGuide/components/advanced.md" import slot_info_trigger %}

## Scroll To Top Button

<div id="content">

The ```scroll-to-top-button``` component allows users to move to the top of the page.

****Adding a scroll-to-top-button****

Add ```<scroll-to-top-button><scroll-to-top-button/>``` to layout file.

****Options****

| Name     | Type     | Default                 | Description                        |
|----------|----------|-------------------------|------------------------------------|
| icon     | `String` | `fa fa-arrow-circle-up` | Icon used for button.              |
| iconSize | `String` | `lg`                    | Size of button.                    |
| bottom   | `String` | `2%`                    | Distance from bottom edge of page. |
| right    | `String` | `2%`                    | Distance from right edge of page.  |

</div>

<div id="short">

```html
<scroll-to-top-button
    icon="fa fa-arrow-circle-up"
    iconSize="2x"
    bottom="2%"
    right="2%"
></scroll-to-top-button>
```
</div>

<div id="examples" class="d-none">

You can see an example of a scroll to top button on the ==on the bottom right side== of <a target="_blank" href="{{ baseUrl }}/userGuide/formattingContents.html">this page</a>.
</div>
