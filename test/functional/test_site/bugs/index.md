<frontmatter>
title: Open Bugs
header: fixed_header.md
pageNav: 2
</frontmatter>

<div class="website-content">

**Remove extra dummy spans for panel headers**

[Issue #1104](https://github.com/MarkBind/markbind/issues/1104)

[Issue #1071](https://github.com/MarkBind/markbind/issues/1071)

Repro:

<panel header="# Hello">
haha
</panel>

**Make fixed navbar behind modals**

[Issue #1069](https://github.com/MarkBind/markbind/issues/1069)

Repro: (This happens only when the modal is so long that it exceeds the area of the top navbar)

<modal header="**Modal header** :rocket:" id="modal:loremipsum">
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</modal>
<br>
This is the same <trigger for="modal:loremipsum">trigger</trigger> as last one.

**popover initiated by trigger: honor trigger attribute**

<a href="https://github.com/MarkBind/markbind/issues/49">Issue #49</a>

Repro:

<trigger for="pop:xp-user-stories">Establishing Requirements</trigger>

<popover id="pop:xp-user-stories" trigger="click">
  <div slot="content">
    <include src="../requirements/EstablishingRequirements.md#preview" />
  </div>
</popover>

**Support multiple inclusions of a modal**

<a href="https://github.com/MarkBind/markbind/issues/107">Issue #107</a>

Repro:

<include src="modal.md" />
<include src="modal.md" />

**Remove extra space in links**

<a href="https://github.com/MarkBind/markbind/issues/147">Issue #147</a>

Repro:

This is a link. 
[[link text](https://github.com)]

</div>
