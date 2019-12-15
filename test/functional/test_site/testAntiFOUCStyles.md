<!-- Anti-FOUC styles should be applied to navbar and dropdown in navbar. -->

<navbar type="dark">
  <li><a href="/" class="nav-link">One</a></li>
  <li><a href="/" class="nav-link">Two</a></li>
  <dropdown text="Dropdown" class="nav-link">
    <li><a class="dropdown-item" href="/">Dropdown One</a></li>
    <li><a class="dropdown-item" href="/">Dropdown Two</a></li>
  </dropdown>
</navbar>

<!-- Anti-FOUC styles should be applied to dropdown. -->
**Test dropdown in body with text and class attributes**

<dropdown text="Test One" class="test-class">
  <li><a class="dropdown-item" href="/">Dropdown One</a></li>
  <li><a class="dropdown-item" href="/">Dropdown Two</a></li>
</dropdown>

<!-- Anti-FOUC styles should be correctly applied to dropdown with no text or class. -->

**Test dropdown in body without text and class attributes**

<dropdown>
  <button slot="button" type="button" class="btn dropdown-toggle">
    Test Two
    <span class="caret"></span>
  </button>
  <li><a class="dropdown-item" href="/">Dropdown One</a></li>
  <li><a class="dropdown-item" href="/">Dropdown Two</a></li>
</dropdown>

<!-- Filler text to increase page length. -->

**Filler text**

<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>

Some text
