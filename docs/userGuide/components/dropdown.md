# Dropdown

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
    <dropdown>
      <button slot="button" type="button" class="btn btn-secondary dropdown-toggle">
        Action
        <span class="caret"></span>
      </button>
      <ul slot="dropdown-menu" class="dropdown-menu">
        <li><a href="#dropdown" class="dropdown-item">Action</a></li>
        <li><a href="#dropdown" class="dropdown-item">Another action</a></li>
        <li><a href="#dropdown" class="dropdown-item">Something else here</a></li>
        <li role="separator" class="dropdown-divider"></li>
        <li><a href="#dropdown" class="dropdown-item">Separated link</a></li>
      </ul>
    </dropdown>
    <dropdown text="Action" type="primary">
      <li><a href="#dropdown" class="dropdown-item">Action</a></li>
      <li><a href="#dropdown" class="dropdown-item">Another action</a></li>
      <li><a href="#dropdown" class="dropdown-item">Something else here</a></li>
      <li role="separator" class="dropdown-divider"></li>
      <li><a href="#dropdown" class="dropdown-item">Separated link</a></li>
    </dropdown>
    <dropdown>
      <button slot="button" type="button" class="btn btn-success dropdown-toggle">
        Action <span class="caret"></span>
      </button>
      <ul slot="dropdown-menu" class="dropdown-menu">
        <li><a href="#dropdown" class="dropdown-item">Action</a></li>
        <li><a href="#dropdown" class="dropdown-item">Another action</a></li>
        <li><a href="#dropdown" class="dropdown-item">Something else here</a></li>
        <li role="separator" class="dropdown-divider"></li>
        <li><a href="#dropdown" class="dropdown-item">Separated link</a></li>
      </ul>
    </dropdown>
    <dropdown text="Disabled" type="warning" disabled>
      <li><a href="#dropdown" class="dropdown-item">Action</a></li>
    </dropdown>
    <dropdown type="info">
      <button slot="before" type="button" class="btn btn-info">Segmented</button>
      <li><a href="#dropdown" class="dropdown-item">Action</a></li>
    </dropdown>
    <dropdown text="Right aligned list" type="primary" menu-align-right>
      <li><a href="#dropdown" class="dropdown-item">Something else here</a></li>
    </dropdown>
    <div><br></div>
    <div class="btn-group d-flex" role="group">
      <a href="#dropdown" class="btn btn-danger w-100" role="button">Left</a>
      <dropdown class="w-100">
        <a slot="button" href="#dropdown" class="btn btn-warning dropdown-toggle w-100">
          Dropdown <span class="caret"></span>
        </a>
        <ul slot="dropdown-menu" class="dropdown-menu">
          <li><a href="#dropdown" class="dropdown-item">Action</a></li>
          <li><a href="#dropdown" class="dropdown-item">Another action</a></li>
          <li><a href="#dropdown" class="dropdown-item">Something else here</a></li>
          <li role="separator" class="dropdown-divider"></li>
          <li><a href="#dropdown" class="dropdown-item">Separated link</a></li>
        </ul>
      </dropdown>
      <a href="#dropdown" class="btn btn-success w-100" role="button">Right</a>
    </div>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<dropdown text="Action" type="primary">
  <li><a href="#dropdown" class="dropdown-item">Action</a></li>
  <li><a href="#dropdown" class="dropdown-item">Another action</a></li>
  <li><a href="#dropdown" class="dropdown-item">Something else here</a></li>
  <li role="separator" class="dropdown-divider"></li>
  <li><a href="#dropdown" class="dropdown-item">Separated link</a></li>
</dropdown>

<!-- For segmented dropdown, ignore text and add a "before" slot -->
<dropdown type="info">
  <button slot="before" type="button" class="btn btn-info">Segmented</button>
  <li><a href="#dropdown" class="dropdown-item">...</a></li>
</dropdown>

<!-- Right aligned list -->
<dropdown text="Right aligned list" type="primary" menu-align-right>
  <li><a href="#dropdown" class="dropdown-item">Something else here</a></li>
</dropdown>

<!-- In a button group -->
<div class="btn-group d-flex" role="group">
  <a href="#dropdown" class="btn btn-danger w-100" role="button">Left</a>
  <!-- With slots you can handle some elements as native bootstrap -->
  <dropdown class="w-100">
    <button slot="button" type="button" class="btn btn-warning dropdown-toggle w-100">
      Action
      <span class="caret"></span>
    </button>
    <ul slot="dropdown-menu" class="dropdown-menu">
      <li><a href="#dropdown" class="dropdown-item">Action</a></li>
      <li><a href="#dropdown" class="dropdown-item">Another action</a></li>
      <li><a href="#dropdown" class="dropdown-item">Something else here</a></li>
      <li role="separator" class="dropdown-divider"></li>
      <li><a href="#dropdown" class="dropdown-item">Separated link</a></li>
    </ul>
  </dropdown>
  <a href="#dropdown" class="btn btn-success w-100" role="button">Right</a>
</div>
```
</tip-box>
<br>

## Dropdown Options
Name | Type | Default | Description 
--- | --- | --- | ---
disabled | `Boolean` | `false` | Whether Dropdown can be opened.
menu-align-right | `Boolean` | `false` | Whether the dropdown list will be right-aligned.
text | `String` | `''` | Dropdown button text.
type | `String` | `default` | Supports: `default`, `primary`, `danger`, `info`, `warning`, `success`.

## Bootstrap Buttons

You may refer to [this documentation](https://getbootstrap.com/docs/4.0/components/buttons/) regarding how you can use the Bootstrap buttons, and how to style them.
