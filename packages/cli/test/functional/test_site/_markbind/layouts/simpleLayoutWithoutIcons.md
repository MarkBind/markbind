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
    <div class="nav-component slim-scroll">
    </div>
  </nav>
  <div id="content-wrapper">
    <breadcrumb />
    {{ content }}
  </div>
  <nav id="page-nav">
    <div class="nav-component slim-scroll">
      <page-nav />
    </div>
  </nav>
</div>
