## Modal

**Modals are to be used together with the [Trigger](#trigger) component for activation.**

****Options****
Name | type | Default | Description
--- | --- | --- | ---
title | `String` | `''` | Title of the Modal component.
ok-text | `String` | `''` | Text for the OK button.
effect | `String` | `zoom` | Supports: `zoom`, `fade`.
id | `String` | | Used by [Trigger](#trigger) to activate the Modal by id.
width | `Number`, `String`, or `null` | `null` | Passing a `Number` will be translated to pixels.<br>`String` can be passed [CSS units](https://www.w3schools.com/cssref/css_units.asp), ( e.g. '50in' or '30vw' ).<br>`null` will default to Bootstrap's responsive sizing.
large | `Boolean` | `false` | Creates a [large Modal](https://getbootstrap.com/docs/4.0/components/modal/#optional-sizes).
small | `Boolean` | `false` | Creates a [small Modal](https://getbootstrap.com/docs/4.0/components/modal/#optional-sizes).
backdrop | `Boolean` | `true` | Enables closing the Modal by clicking on the backdrop.
