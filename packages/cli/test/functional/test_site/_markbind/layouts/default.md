<head-top>
<meta name="default-head-top">
<script src="{{baseUrl}}/headFiles/customScriptTop.js"></script>
</head-top>
<head-bottom>
<meta name="default-head-bottom">
<link rel="stylesheet" href="{{baseUrl}}/stylesheets/styles.css">
<script src="{{baseUrl}}/headFiles/customScriptBottom.js"></script>
</head-bottom>

<include src="headers/header.md" />

<div id="flex-body">
  <nav id="site-nav" class="fixed-header-padding">
    <div class="site-nav-top">
      <div class="fw-bold mb-2" style="font-size: 1.25rem;"><markdown>## {{ layoutName or "Default Layout" }}</markdown></div>
    </div>
    <div class="nav-component slim-scroll">
      <include src="navigation/site-nav.md" />
    </div>
  </nav>
  <div id="content-wrapper" class="fixed-header-padding">
    {{ content }}
  </div>
  <nav id="page-nav" class="fixed-header-padding">
    <div class="nav-component slim-scroll">
      <page-nav />
    </div>
  </nav>
</div>

<include src="footers/footer.md" />
