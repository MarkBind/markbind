<header>
  <link rel="stylesheet" href="../css/main.css">
  <navbar type="none" add-class="bg-brand">
    <a slot="brand" href="../index.html" title="Home" class="navbar-brand"><img src="../images/logo-white.png" height="20" /></a>
    <li><a href="../index.html" class="text-light nav-link">HOME</a></li>
    <li><a href="../userGuide/index.html" class="text-light nav-link">USER GUIDE</a></li>
    <li><a href="../showcase.html" class="text-light nav-link">SHOWCASE</a></li>
    <li><a href="../about.html" class="text-light nav-link">ABOUT</a></li>
    <li><a href="../devGuide/index.html" class="text-light nav-link">DEVELOPER GUIDE</a></li>
    <li>
      <a href="https://github.com/MarkBind/markbind" target="_blank" class="text-light nav-link"><md>:fab-github:</md></a>
    </li>
    <li slot="right">
      <form class="navbar-form">
        <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback" menu-align-right></searchbar>
      </form>
    </li>
  </navbar>
</header>
