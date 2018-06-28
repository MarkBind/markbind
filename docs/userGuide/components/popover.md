# Popover

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <popover effect="fade" content="Lorem ipsum dolor sit amet" placement="top">
    <button class="btn btn-default">Popover on top</button>
  </popover>
  <popover effect="fade" content="Lorem ipsum dolor sit amet" placement="left">
    <button class="btn btn-default">Popover on left</button>
  </popover>
  <popover effect="fade" content="Lorem ipsum dolor sit amet" placement="right">
    <button class="btn btn-default">Popover on right</button>
  </popover>
  <popover effect="fade" content="Lorem ipsum dolor sit amet" placement="bottom">
    <button class="btn btn-default">Popover on bottom</button>
  </popover>
  <hr>
  <h4>Title</h4>
  <popover effect="fade" header title="Title" content="Lorem ipsum dolor sit amet" placement="top">
    <button class="btn btn-default">Popover on top</button>
  </popover>
  <popover effect="fade" header title="Title" content="Lorem ipsum dolor sit amet" placement="left">
    <button class="btn btn-default">Popover on left</button>
  </popover>
  <popover effect="fade" header title="Title" content="Lorem ipsum dolor sit amet" placement="right">
    <button class="btn btn-default">Popover on right</button>
  </popover>
  <popover effect="fade" header title="Title" content="Lorem ipsum dolor sit amet" placement="bottom">
    <button class="btn btn-default">Popover on bottom</button>
  </popover>
  <hr />
  <h4>Trigger</h4>
  <p>
    <popover effect="scale" title="Title" content="Lorem ipsum dolor sit amet" placement="top" trigger="hover">
      <button class="btn btn-default">Mouseenter</button>
    </popover>
    <popover effect="scale" title="Title" content="Lorem ipsum dolor sit amet" placement="top" trigger="contextmenu">
      <button class="btn btn-default">Contextmenu (right click)</button>
    </popover>
  </p>
  <h4>Markdown</h4>
  <p>
    <popover effect="scale" title="**Emoji title** :rocket:" content="++emoji++ content :cat:">
      <button class="btn btn-default">Hover</button>
    </popover>
  </p>
  <h4>Content using slot</h4>
  <popover effect="scale" title="**Emoji title** :rocket:">
    <div slot="content">
      This is a long content...
    </div>
    <button class="btn btn-default">Hover</button>
  </popover>
  <br />
  <br />
  <h4>Wrap Text</h4>
  <popover header="false" content="Nice!">What do you say</popover>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

  ``` html
  <popover effect="fade" content="Lorem ipsum dolor sit amet" placement="top">
    <button class="btn btn-default">Popover on top</button>
  </popover>
  <popover effect="fade" content="Lorem ipsum dolor sit amet" placement="left">
    <button class="btn btn-default">Popover on left</button>
  </popover>
  <popover effect="fade" content="Lorem ipsum dolor sit amet" placement="right">
    <button class="btn btn-default">Popover on right</button>
  </popover>
  <popover effect="fade" content="Lorem ipsum dolor sit amet" placement="bottom">
    <button class="btn btn-default">Popover on bottom</button>
  </popover>
  <hr>
  <h4>Title</h4>
  <popover effect="fade" header title="Title" content="Lorem ipsum dolor sit amet" placement="top">
    <button class="btn btn-default">Popover on top</button>
  </popover>
  <popover effect="fade" header title="Title" content="Lorem ipsum dolor sit amet" placement="left">
    <button class="btn btn-default">Popover on left</button>
  </popover>
  <popover effect="fade" header title="Title" content="Lorem ipsum dolor sit amet" placement="right">
    <button class="btn btn-default">Popover on right</button>
  </popover>
  <popover effect="fade" header title="Title" content="Lorem ipsum dolor sit amet" placement="bottom">
    <button class="btn btn-default">Popover on bottom</button>
  </popover>
  <hr />
  <h4>Trigger</h4>
  <p>
    <popover effect="scale" title="Title" content="Lorem ipsum dolor sit amet" placement="top" trigger="hover">
      <button class="btn btn-default">Mouseenter</button>
    </popover>
    <popover effect="scale" title="Title" content="Lorem ipsum dolor sit amet" placement="top" trigger="contextmenu">
      <button class="btn btn-default">Contextmenu (right click)</button>
    </popover>
  </p>
  <h4>Markdown</h4>
  <p>
    <popover effect="scale" title="**Emoji title** :rocket:" content="++emoji++ content :cat:">
      <button class="btn btn-default">Hover</button>
    </popover>
  </p>
  <h4>Content using slot</h4>
  <popover effect="scale" title="**Emoji title** :rocket:">
    <div slot="content">
      This is a long content...
    </div>
    <button class="btn btn-default">Hover</button>
  </popover>
  <br />
  <br />
  <h4>Wrap Text</h4>
  <popover header="false" content="Nice!">What do you say</popover>
  ```
</tip-box>

## Popover Options

Name | Type | Default | Description
---- | ---- | ------- | ------
trigger | `String`, one of `click` `focus` `hover` `contextmenu` |	`hover`	| How the popover is triggered.
effect | `String`, one of `scale` `fade` | `fade`
title | `String`, or be markdown inline text
content | `String`, or be markdown inline text
header | `Boolean` | `true` |	Whether to show the header.
placement | `String`, one of `top` `left` `right` `bottom` | `top` | How to position the popover.