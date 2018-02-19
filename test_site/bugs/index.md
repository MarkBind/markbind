<include src="../components/header.md" />

<div class="website-content">

## popover initiated by trigger: honor trigger attribute
<a href="https://github.com/MarkBind/markbind/issues/49">Issue #49</a>

Repro:

<trigger for="pop:xp-user-stories">Establishing Requirements</trigger>

<popover id="pop:xp-user-stories" trigger="click">
  <div slot="content">
    <include src="../requirements/EstablishingRequirements.md#preview" />
  </div>
</popover>

## Support multiple inclusions of a modal
<a href="https://github.com/MarkBind/markbind/issues/107">Issue #107</a>

Repro:

<include src="modal.md" />
<include src="modal.md" />

## Remove extra space in links
<a href="https://github.com/MarkBind/markbind/issues/147">Issue #147</a>

Repro:

This is a link. 
[[link text](https://github.com)]

</div>
