<header>
  <link rel="stylesheet" href="../css/main.css">
  <navbar type="inverse">
    <a slot="brand" href="../index.html" title="Home" class="navbar-brand"><img src="../images/logo-darkbackground.png" height="20" /></a>
    <li><a href="../index.html" class="nav-link">HOME</a></li>
    <li><a href="../userGuide/index.html" class="nav-link">USER GUIDE</a></li>
    <li><a href="../showcase.html" class="nav-link">SHOWCASE</a></li>
    <li><a href="../about.html" class="nav-link">ABOUT</a></li>
    <li><a href="../devGuide/index.html" class="nav-link">DEVELOPER GUIDE</a></li>
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
