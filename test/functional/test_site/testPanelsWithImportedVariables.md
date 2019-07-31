Refer to this comment: https://github.com/MarkBind/markbind/pull/751#issuecomment-469670640

<import from="panelSrcs.md" as="child"/>
{{ child.title }}


## Below panel is working
<panel src="{{ child.child_src_working }}.md"></panel>

## Below should be a panel, but is now an error.
<panel src="{{ child.child_src }}"></panel>