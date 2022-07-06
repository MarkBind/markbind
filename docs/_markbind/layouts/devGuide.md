{% include "_markbind/layouts/headers/header.md" %}

<div id="flex-body">
  <nav id="site-nav">
    <div class="site-nav-top">
      <div class="fw-bold mb-2" style="font-size: 1.25rem;">Developer Guide</div>
    </div>
    <div class="nav-component slim-scroll">
      <site-nav>
* [Contributing]({{baseUrl}}/devGuide/devGuide.html)
* [Setting up]({{baseUrl}}/devGuide/settingUp.html)
* [Workflow]({{baseUrl}}/devGuide/workflow.html)
* Design :expanded:
  * [Project Structure]({{baseUrl}}/devGuide/design/projectStructure.html)
  * [Architecture]({{baseUrl}}/devGuide/design/architecture.html)
  * [Server Side Rendering]({{baseUrl}}/devGuide/design/serverSideRendering.html)
* [Writing Components]({{baseUrl}}/devGuide/writingComponents.html)
* [Writing Plugins]({{baseUrl}}/devGuide/writingPlugins.html)
* [Migrating to TypeScript]({{baseUrl}}/devGuide/migratingToTypeScript.html)
* GitHub Actions :expanded:
  * [Overview]({{baseUrl}}/devGuide/githubActions/overview.html)
  * [markbind-action]({{baseUrl}}/devGuide/githubActions/markbindAction.html)
  * [markbind-reusable-workflows]({{baseUrl}}/devGuide/githubActions/markbindReusableWorkflows.html)
* [Project management]({{baseUrl}}/devGuide/projectManagement.html)
* Appendices :expanded:
  * [Style guides]({{baseUrl}}/devGuide/styleGuides.html)
      </site-nav>
    </div>
  </nav>
  <div id="content-wrapper">
    {{ content }}
  </div>
  <nav id="page-nav">
    <div class="nav-component slim-scroll">
      <page-nav />
    </div>
  </nav>
</div>

<include src="footers/footer.md" />
