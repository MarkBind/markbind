<link rel="stylesheet" href="{{baseUrl}}/css/main.css">
<navbar placement="top" type="inverse">
  <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand"><img src="{{baseUrl}}/images/logo-darkbackground.png" height="20" /></a>
  <dropdown text="User Guide">
    <li><a href="{{baseUrl}}/userGuide/index.html">Home</a></li>
    <li><a href="{{baseUrl}}/userGuide/userQuickStart.html">Quick Start</a></li>
    <li role="separator" class="divider"></li>
    <li><a href="{{baseUrl}}/userGuide/developingASite.html">Developing a Site</a>
    <li><a href="{{baseUrl}}/userGuide/siteConfiguration.html">◦&nbsp; Site Configuration</a></li>
    <li role="separator" class="divider"></li>
    <li><a href="{{baseUrl}}/userGuide/contentAuthoring.html">Content Authoring</a></li>
    <li><a href="{{baseUrl}}/userGuide/includingContents.html">◦&nbsp; Including Contents</a></li>
    <li><a href="{{baseUrl}}/userGuide/knownProblems.html">◦&nbsp; Known Problems</a></li>
    <li role="separator" class="divider"></li>
    <li style="margin: 3px 20px;">Deploying a Site</li>
    <li><a href="{{baseUrl}}/userGuide/ghpagesDeployment.html">◦&nbsp; Github Pages Deployment</a></li>
    <li><a href="{{baseUrl}}/userGuide/netlifyPreview.html">◦&nbsp; Preview site on Netlify</a></li>
    <li role="separator" class="divider"></li>
    <li><a href="{{baseUrl}}/userGuide/componentsReference/index.html">Components Reference</a></li>
  </dropdown>
  <li>
    <a href="https://github.com/MarkBind/markbind" target="_blank">
      Fork this project on Github
      <svg height="16px" fill="#777" class="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
    </a>
  </li>
  <li slot="right">
    <form class="navbar-form">
      <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
    </form>
  </li>
</navbar>
