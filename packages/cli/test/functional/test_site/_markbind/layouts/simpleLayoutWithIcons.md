<head-top>
<meta name="default-head-top">
</head-top>
<head-bottom>
<meta name="default-head-bottom">
<link rel="stylesheet" href="{{baseUrl}}/stylesheets/styles.css">
</head-bottom>

<include src="headers/header.md" />

<div id="flex-body">
  <nav id="site-nav">
    <div class="nav-component slim-scroll">\
        <md>An glyphicon icon is supposed to appear here ---> :glyphicon-hand-right:</md>
    </div>
  </nav>
  <div id="content-wrapper">
    <breadcrumb />
    {{ content }}
  </div>
  <nav id="page-nav">
    <div class="nav-component slim-scroll">
      <page-nav />
        <md>A font-awesome icon is supposed to appear here ---> :fas-code-branch:</md>
    </div>
  </nav>
</div>
