**Modal with attributes**

This is a <trigger for="modal:loremipsum" trigger="hover">hover trigger</trigger> for a modal.
<modal header="**Modal header** :rocket:" id="modal:loremipsum">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</modal>
<br>
This is the same <trigger for="modal:loremipsum" trigger="click">click trigger</trigger> as last one.

<trigger for="modal:centered">Trigger for a centered modal with no header</trigger>.
<modal id="modal:centered" center>
  Centered modal contents _(this modal has no header)_
</modal>

<trigger for="modal:ok-text">Trigger for centered modal with a custom OK button</trigger>.
<modal header="++OK button visible!++" id="modal:ok-text" ok-text="Custom OK" center>
  Content of a modal with ++OK button++
</modal>

<trigger for="modal:small">Trigger for a small modal</trigger>.
<modal header="Small modal title" id="modal:small" small>
  Content of a small modal
</modal>

<trigger for="modal:large">Trigger for a large modal</trigger>.
<modal header="Large modal title" id="modal:large" large>
  Content of a large modal
</modal>

<trigger for="modal:fade">Trigger for a modal with _fade_ effect</trigger>.
<modal header="_Fading modal_ title" id="modal:fade" center effect="fade">
  Content of a fade modal 
</modal>

<trigger for="modal:backdrop" trigger="click">Click trigger for a backdrop modal</trigger>.
<trigger for="modal:backdrop" trigger="hover">Hover trigger for a backdrop modal</trigger>.

<modal header="backdrop modal title" id="modal:backdrop" backdrop="false">
  Content of a backdrop modal.
  It cannot be closed by clicking outside the modal.
</modal>

<trigger for="modal:longtext">Trigger for modal that should overflow</trigger>.
<modal header="++this modal has long text++" id="modal:longtext" large>
<p>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
<p>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
<p>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
<p>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
<p>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
<p>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
<p>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
</modal>

**Modal with slots**

<trigger for="modal:with-slots">Trigger for a modal with slots</trigger>.
<modal id="modal:with-slots">
  <span slot="header">Modal header from a slot</span>
  <div slot="footer">
    Footer from a slot:
    <button class="btn btn-primary">Primary btn</button>
    <button class="btn btn-secondary">secondary btn</button>
  </div>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</modal>

**Modal with slots overriding attributes**

<trigger for="modal:with-slots-and-attribs">Trigger for a modal with slots</trigger>.
<modal id="modal:with-slots-and-attribs" header="This header attrib should be overwritten by slot">
  <div slot="header">Modal header from a slot correctly overriding attribute</div>
  <div slot="footer">
    Footer from a slot:
    <button class="btn btn-primary">Primary btn</button>
    <button class="btn btn-secondary">secondary btn</button>
  </div>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</modal>

**Modal containing headers**

<trigger for="modal:withpanel">Open modal with panel</trigger>.
<modal header="has a panel" id="modal:withpanel">

# Heading inside modal should not appear in pagenav and search

## Another heading inside modal should not appear in pagenav and search

<panel expanded panelId="panel-inside-modal" header="## Heading inside panel inside modal should not appear in pagenav and search">
  Panel content
</panel>
</modal>
