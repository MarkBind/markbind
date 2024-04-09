## Icons

<small>%%Acknowledgement: Font Awesome icons are provided by [Font Awesome](https://fontawesome.com/) under their [free license](https://fontawesome.com/license), Glyphicons are provided by [Glyphicons](https://glyphicons.com/) via [Bootstrap 3](https://getbootstrap.com/docs/3.3/). Bootstrap icons are designed by [@mdo](https://github.com/mdo), maintained by the [Bootstrap Team](https://github.com/orgs/twbs/people) and provided under MIT liscense. [Octicons](https://octicons.github.com) are copyright of GitHub, and Material icons are provided by [Google Fonts](https://fonts.google.com/icons) via [`material-icons` by Ravindra Marella](https://www.npmjs.com/package/material-icons) under the [Apache license 2.0](https://www.apache.org/licenses/LICENSE-2.0.html).%%</small>

MarkBind supports using Font Icons provided by Font Awesome, Glyphicons, GitHub's Octicons and Bootstrap icons.

<include src="tip.md" boilerplate >
<span id="tip_body">
The advantage of font icons over emojis is font icons can be _styled_ to fit your needs. e.g.,
* emoji: <span style="color: purple">Don't judge the :book: by its cover! :-1:</span>
* font icons: <span style="color: purple">Don't judge the :fa-solid-book: by its cover! {{ icon_dislike }}</span>
</span>
</include>

###### Using Font Awesome Icons

<box type="info" seamless>

MarkBind currently supports Version 6 of Font Awesome (Free plan). For detailed changes between versions, refer to [Font Awesome's documentation](https://fontawesome.com/docs/web/setup/upgrade/whats-changed).

</box>

1. Decide which icon you want to use from the [list of available icons](https://fontawesome.com/icons?d=gallery&m=free).
1. Construct the MarkBind name for the selected icon by adding the _type prefix_.
   Note: Font Awesome has two different styles for their icons, each with their own type prefix. Here is an example from each type:
   * _Solid_ (prefix: `fa-solid-`) e.g., :fa-solid-file-code: (actual name `file-code`, MarkBind name `fa-solid-file-code`)
   * _Brands_ (prefix: `fa-brands-`): e.g., :fa-brands-github-alt: (actual name `github-alt`, MarkBind name `fa-brands-github-alt`)

1. Insert MarkBind name for the icon enclosed within colons to get the icon in your page.<br>
  `Create a **branch**`<code>:<span></span>fas-code-branch: now!</code> → Create a **branch** :fas-code-branch: now!


###### Using Glyphicons

1. Decide which icon you want to use from [list of provided glyphicons](https://getbootstrap.com/docs/3.3/components/#glyphicons).
1. Insert the name for the icon enclosed within colons to get the icon in your page.<br>
  `Move to the right!`<code>:<span></span>glyphicon-hand-right:</code> → Move to the right! :glyphicon-hand-right:

<div id="short" class="d-none">

<code>:<span></span>glyphicon-hand-right:</code> <code>:<span></span>fa-brands-github:</code> <code>:<span></span>fa-solid-home:</code>

</div>

<div id="examples" class="d-none">

:glyphicon-hand-right: :fa-brands-github: :fa-solid-home: %%:glyphicon-hand-right: :fa-brands-github: :fa-solid-home:%% <span style="color: red">:glyphicon-hand-right: :fa-brands-github: :fa-solid-home:</span>
</div>

###### Using Octicons

1. Decide which icon you want to use from [list of available Octicons](https://octicons.github.com).
1. Insert the name for the icon enclosed within colons to get the icon in your page.<br>
  `Merge a **pull request** :octicon-git-pull-request:` → Merge a **pull request** :octicon-git-pull-request:
1. You may also append `~class-name` to the end of the octicon name to add `class="class-name"` property to your Octicon (e.g. `:octicon-git-pull-request~icon-large-red:` will generate an Octicon of class *icon-large-red*). You may then add corresponding CSS to `{root}/_markbind/layouts/{layout-name}/styles.css` to customize the style of your Octicon.
1. If your background is dark, you may use `:octiconlight-*:` to render the icon as white. 

###### Using Bootstrap icons

1. Decide which icon you want to use from [list of available Bootstrap icons](https://icons.getbootstrap.com).
1. Insert the name for the icon enclosed within colons to get the icon in your page.<br>
  `Add a romantic touch with :bi-arrow-through-heart:` → Add a romantic touch with :bi-arrow-through-heart:

###### Using Material Icons

1. Decide which icon you want to use from [list of available icons](https://fonts.google.com/icons).
1. Construct the MarkBind name for the selected icon by writing the icon name in _lowercase letters only_, replacing any spaces between the words in the name with _dashes_ (`-`), then adding the _type prefix_.
   Note: Google has five different styles for their Material icons, each with their own type prefix. Here is an example from each type:
   * _Filled_ (prefix: `mif-`) e.g. :mif-perm-media: (actual name `Perm Media`, MarkBind name `mif-perm-media`)
   * _Outlined_ (prefix: `mio-`) e.g., :mio-perm-media: (actual name `Perm Media`, MarkBind name `mio-perm-media`)
   * _Rounded_ (prefix: `mir-`): e.g., :mir-perm-media: (actual name `Perm Media`, MarkBind name `mir-perm-media`)
   * _Sharp_ (prefix: `mis-`): e.g., :mis-perm-media: (actual name `Perm Media`, MarkBind name `mis-perm-media`)
   * _Two tone_ (prefix: `mit-`): e.g., :mit-perm-media: (actual name `Perm Media`, MarkBind name `mit-perm-media`)
  
1. Insert the name for the icon enclosed within colons to get the icon in your page.<br>
  `Download from Cloud :mio-cloud-download:` → Download from Cloud :mio-cloud-download:
