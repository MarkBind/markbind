{% include "_markbind/layouts/headers/header.md" %}

<div id="flex-body">
  <nav id="site-nav">
    <div class="site-nav-top">
      <div class="fw-bold mb-2" style="font-size: 1.25rem;">Developer Guide</div>
    </div>
    <div class="nav-component slim-scroll">
      <site-nav>
* [Contributing]({{baseUrl}}/devGuide/devGuide.html)
* Onboarding Bootcamp
  * [Introduction]({{baseUrl}}/devGuide/bootcamp/intro.html)
  * [Explore MarkBind as a User]({{baseUrl}}/devGuide/bootcamp/exploreMarkBind.html)
  * [Contribute to Documentation]({{baseUrl}}/devGuide/bootcamp/contributeToDocs.html)
  * [Fix a Bug]({{baseUrl}}/devGuide/bootcamp/fixABug.html)
  * [Implement a New Feature]({{baseUrl}}/devGuide/bootcamp/implementAFeature.html)
* Development :expanded:
  * [Setting up]({{baseUrl}}/devGuide/development/settingUp.html)
  * [Workflow]({{baseUrl}}/devGuide/development/workflow.html)
  * [Writing Components]({{baseUrl}}/devGuide/development/writingComponents.html)
  * [Writing Plugins]({{baseUrl}}/devGuide/development/writingPlugins.html)
  * [Migrating to TypeScript]({{baseUrl}}/devGuide/development/migratingToTypeScript.html)
  * [Migrating Node.js]({{baseUrl}}/devGuide/development/migratingNodeJs.html)
* Design :expanded:
  * [Project Structure]({{baseUrl}}/devGuide/design/projectStructure.html)
  * [Architecture]({{baseUrl}}/devGuide/design/architecture.html)
  * [Server Side Rendering]({{baseUrl}}/devGuide/design/serverSideRendering.html)
* GitHub Actions
  * [Overview]({{baseUrl}}/devGuide/githubActions/overview.html)
  * [markbind-action]({{baseUrl}}/devGuide/githubActions/markbindAction.html)
  * [markbind-reusable-workflows]({{baseUrl}}/devGuide/githubActions/markbindReusableWorkflows.html)
* [Project management]({{baseUrl}}/devGuide/projectManagement.html)
* Appendices :expanded:
  * [Style guides]({{baseUrl}}/devGuide/styleGuides.html)
      </site-nav>
    </div>
  <collapse-expand-buttons />
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
  <scroll-top-button></scroll-top-button>
</div>

<include src="footers/footer.md" />
