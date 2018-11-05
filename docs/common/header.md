<link rel="stylesheet" href="{{baseUrl}}/css/main.css">
<navbar placement="top" type="inverse">
  <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand"><img src="{{baseUrl}}/images/logo-darkbackground.png" height="20" /></a>
  <dropdown text="User Guide" class="nav-link">
    <li><a href="{{baseUrl}}/userGuide/index.html" class="dropdown-item">Home</a></li>
    <li><a href="{{baseUrl}}/userGuide/userQuickStart.html" class="dropdown-item">Quick Start</a></li>
    <li role="separator" class="dropdown-divider"></li>
    <li><a href="{{baseUrl}}/userGuide/developingASite.html" class="dropdown-item">Developing a Site</a>
    <li><a href="{{baseUrl}}/userGuide/siteConfiguration.html" class="dropdown-item">◦&nbsp; Site Configuration</a></li>
    <li role="separator" class="dropdown-divider"></li>
    <li><a href="{{baseUrl}}/userGuide/contentAuthoring.html" class="dropdown-item">Content Authoring</a></li>
    <li><a href="{{baseUrl}}/userGuide/includingContents.html" class="dropdown-item">◦&nbsp; Including Contents</a></li>
    <li><a href="{{baseUrl}}/userGuide/usingComponents.html" class="dropdown-item">◦&nbsp; Using Components</a></li>
    <li><a href="{{baseUrl}}/userGuide/usingVariables.html" class="dropdown-item">◦&nbsp; Using Variables</a></li>
    <li><a href="{{baseUrl}}/userGuide/pageLayout.html" class="dropdown-item">◦&nbsp; Page Layout</a></li>
    <li><a href="{{baseUrl}}/userGuide/knownProblems.html" class="dropdown-item">◦&nbsp; Known Problems</a></li>
    <li role="separator" class="dropdown-divider"></li>
    <li class="dropdown-header">Deploying a Site</li>
    <li><a href="{{baseUrl}}/userGuide/ghpagesDeployment.html" class="dropdown-item">◦&nbsp; Github Pages Deployment</a></li>
    <li><a href="{{baseUrl}}/userGuide/netlifyPreview.html" class="dropdown-item">◦&nbsp; Preview site on Netlify</a></li>
    <li role="separator" class="dropdown-divider"></li>
    <li><a href="{{baseUrl}}/userGuide/components.html" class="dropdown-item">Components Reference</a></li>
  </dropdown>
  <li>
    <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link">
      Fork this project on Github
      <svg height="16px" fill="#777" class="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
    </a>
  </li>
  <li slot="right">
    <form class="navbar-form">
      <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback" menu-align-right></searchbar>
    </form>
  </li>
</navbar>
