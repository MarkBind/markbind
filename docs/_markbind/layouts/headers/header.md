<head-bottom>
  <link rel="stylesheet" href="{{baseUrl}}/css/main.css">
</head-bottom>

<header fixed>
  <navbar type="dark">
    <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand"><img src="{{baseUrl}}/images/logo-darkbackground.svg" height="20"></a>
    <li><a highlight-on="exact" href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>
    <div tags="environment--ug"><li><a highlight-on="sibling-or-child" href="{{baseUrl}}/userGuide/index.html" class="nav-link">USER GUIDE</a></li></div>
    <div tags="environment--dg"><li><a highlight-on="sibling-or-child" href="{{baseUrl}}/devGuide/index.html" class="nav-link">DEVELOPER GUIDE</a></li></div>
    <li><a highlight-on="exact" href="{{baseUrl}}/showcase.html" class="nav-link">SHOWCASE</a></li>
    <li><a highlight-on="exact" href="{{baseUrl}}/about.html" class="nav-link">ABOUT</a></li>
    <li>
      <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link"><md>:fab-github:</md></a>
    </li>
    <li><a highlight-on="exact" href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>
    <div tags="environment--ug"><li><a highlight-on="sibling-or-child" href="{{baseUrl}}/userGuide/index.html" class="nav-link">USER GUIDE</a></li></div>
    <div tags="environment--dg"><li><a highlight-on="sibling-or-child" href="{{baseUrl}}/devGuide/index.html" class="nav-link">DEVELOPER GUIDE</a></li></div>
    <li><a highlight-on="exact" href="{{baseUrl}}/showcase.html" class="nav-link">SHOWCASE</a></li>
    <li><a highlight-on="exact" href="{{baseUrl}}/about.html" class="nav-link">ABOUT</a></li>
    <li>
      <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link"><md>:fab-github:</md></a>
    </li>
    <dropdown header="CS3281" class="nav-link">
    <li><a href="{{ baseUrl }}/index.html" class="dropdown-item">Students</a></li>
    <li><a href="{{ baseUrl }}/students/knowledge.html" class="dropdown-item">Knowledge</a></li>
    <li>
        <a href="https://nus-cs3281.github.io/{{ year }}-dashboard/?search=&sort=groupTitle&sortWithin=title&timeframe=commit&mergegroup=&groupSelect=groupByAuthors&breakdown=false" class="dropdown-item">Code Dashboard</a>
      </li>
    </dropdown>
    <dropdown header="CS3282" class="nav-link">
      <li><a href="{{ baseUrl }}/cs3282-index.html" class="dropdown-item">Students</a></li>
      <li><a href="{{ baseUrl }}/students/talksSchedule.html" class="dropdown-item">Lightning Talks</a></li>
    </dropdown>
    <li><a highlight-on="exact" href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>
    <div tags="environment--ug"><li><a highlight-on="sibling-or-child" href="{{baseUrl}}/userGuide/index.html" class="nav-link">USER GUIDE</a></li></div>
    <div tags="environment--dg"><li><a highlight-on="sibling-or-child" href="{{baseUrl}}/devGuide/index.html" class="nav-link">DEVELOPER GUIDE</a></li></div>
    <li><a highlight-on="exact" href="{{baseUrl}}/showcase.html" class="nav-link">SHOWCASE</a></li>
    <li><a highlight-on="exact" href="{{baseUrl}}/about.html" class="nav-link">ABOUT</a></li>
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
