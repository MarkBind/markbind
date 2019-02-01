## Trigger

Trigger provides more flexibility in triggering contextual overlay via Tooltip, Popover or Modal.

You could embed a Trigger within the text, and define the Tooltip, Popover or Modal at a separate location, which allows for a cleaner authoring flow.

Specify the `id` attribute on the Tooltip, Popover or Modal component, and use the same `id` in the `for` attribute of the Trigger to allow the Trigger to invoke the specific overlay elements.
Additionally, multiple Triggers could share the same overlay by providing them with the same `id`.
<br />

**Using trigger for Tooltip:**<br>

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  More about <trigger for="tt:trigger_id">trigger</trigger>.
  <tooltip id="tt:trigger_id" content="This tooltip triggered by a trigger"></tooltip>
  <br>
  This is the same <trigger for="tt:trigger_id">trigger</trigger> as last one.
</tip-box>

<tip-box border-left-color="black">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

  ``` html
  More about <trigger for="tt:trigger_id">trigger</trigger>.
  <tooltip id="tt:trigger_id" content="This tooltip triggered by a trigger"></tooltip>
  <br>
  This is the same <trigger for="tt:trigger_id">trigger</trigger> as last one.
  ```
</tip-box>

**Using trigger for Popover:**<br>

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  More about <trigger for="pop:trigger_id">trigger</trigger>.
  <popover id="pop:trigger_id" content="This popover is triggered by a trigger"></popover>
  <br>
  This is the same <trigger for="pop:trigger_id">trigger</trigger> as last one.
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

  ``` html
  More about <trigger for="pop:trigger_id">trigger</trigger>.
  <popover id="pop:trigger_id" content="This popover is triggered by a trigger"></popover>
  <br>
  This is the same <trigger for="pop:trigger_id">trigger</trigger> as last one.
  ```
</tip-box>

**Using trigger for Modal:**<br>

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  More about <trigger for="modal:trigger_id">trigger</trigger>.
  <modal title="**Modal title** :rocket:" id="modal:trigger_id">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </modal>
  <br>
  This is the same <trigger for="modal:trigger_id">trigger</trigger> as last one.
</tip-box>

<tip-box border-left-color="black">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

  ``` html
  More about <trigger for="modal:trigger_id">trigger</trigger>.
  <modal title="**Modal title** :rocket:" id="modal:trigger_id">
      ...
  </modal>
  <br>
  This is the same <trigger for="modal:trigger_id">trigger</trigger> as last one.
  ```
</tip-box>

**Trigger's `trigger` attribute (which defaults to `hover`) is independent of the target's.**
<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  This is a hover <trigger for="pop:xp-user-stories">trigger</trigger>.
  <br>
  This is a click
  <popover id="pop:xp-user-stories" trigger="click" content="User stories..." >
    popover
  </popover>.
</tip-box>

<tip-box border-left-color="black">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

  ``` html
  This is a hover <trigger for="pop:xp-user-stories">trigger</trigger>.
  <br>
  This is a click
  <popover id="pop:xp-user-stories" trigger="click" content="User stories..." >
    popover
  </popover>.
  ```
</tip-box>

****Options****

Name | Type | Default | Description
---- | ---- | ------- | ------
trigger | `String` | `hover` | How the overlay view is triggered.<br>Supports: `click`, `focus`, `hover`, `contextmenu`.
for | `String` | `null` | The id for the overlay view to be shown.