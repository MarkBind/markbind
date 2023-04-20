const pageContent =  `<div id="app">
<header sticky>
  <navbar placement="top" type="dark">
    <template #brand><a href="/index.html" title="Home" class="navbar-brand">
      <i class="far fa-file-image"></i></a></template>
    <li><a href="/index.html" class="nav-link">HOME</a></li>
    <li><a href="/about.html" class="nav-link">ABOUT</a></li>
    <template #right><li>
      <form class="navbar-form">
        <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback" menu-align-right></searchbar></form></li></template></navbar></header>
<div id="flex-body">
  <overlay-source id="site-nav" tag-name="nav" to="site-nav">
    <div class="site-nav-top">
      <div class="fw-bold mb-2" style="font-size: 1.25rem;">Contents</div></div>
    <div class="nav-component slim-scroll">
      <site-nav><overlay-source class="site-nav-list site-nav-list-root" tag-name="ul" to="mb-site-nav">
<li class="site-nav-custom-list-item site-nav-list-item-0">[[Home]]</li>
<li class="site-nav-custom-list-item site-nav-list-item-0">[[Page-1]]</li>
</overlay-source>
</site-nav></div>
    <collapse-expand-buttons></collapse-expand-buttons></overlay-source>
  <div id="content-wrapper">
    <breadcrumb></breadcrumb>
    <h1 id="page-1">Page 1<a class="fa fa-anchor" href="#page-1" onclick="event.stopPropagation()"></a></h1>
  </div>
  <overlay-source id="page-nav" tag-name="nav" to="page-nav">
    <div class="nav-component slim-scroll">
      </div></overlay-source>
  <scroll-top-button></scroll-top-button></div>
<footer>
Custom footer.
</footer></div>`;