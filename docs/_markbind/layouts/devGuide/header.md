<header>
  <link rel="stylesheet" href="{{baseUrl}}/css/main.css">
  <navbar type="dark">
    <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand"><img src="{{baseUrl}}/images/logo-darkbackground.png" height="20"></a>
    <li><a href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>
    <div tags="environment--ug"><li><a href="{{baseUrl}}/userGuide/index.html" class="nav-link">USER GUIDE</a></li></div>
    <div tags="environment--dg"><li><a href="{{baseUrl}}/devGuide/index.html" class="nav-link">DEVELOPER GUIDE</a></li></div>
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
</header>
