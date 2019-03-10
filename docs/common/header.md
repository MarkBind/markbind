<link rel="stylesheet" href="{{baseUrl}}/css/main.css">
<navbar placement="top" type="inverse">
  <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand"><img src="{{baseUrl}}/images/logo-darkbackground.png" height="20" /></a>
  <li><a href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>
  <li><a href="{{baseUrl}}/userGuide/index.html" class="nav-link">DOCS</a></li>
  <li><a href="{{baseUrl}}/showcase.html" class="nav-link">SHOWCASE</a></li>
  <li><a href="{{baseUrl}}/about.html" class="nav-link">ABOUT</a></li>
  <li>
    <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link"><md>:fab-github:</md></a>
  </li>
  <li slot="right">
    <form class="navbar-form">
      <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback" menu-align-right></searchbar>
    </form>
  </li>
</navbar>
