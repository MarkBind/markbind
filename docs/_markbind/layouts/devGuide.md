<include src="headers/header.mbdf" />

<div id="flex-body">
  <nav id="site-nav" class="fixed-header-padding">
    <div class="site-nav-top">
      <div class="font-weight-bold mb-2" style="font-size: 1.25rem;">Developer Guide</div>
    </div>
    <div class="nav-component slim-scroll">
      <site-nav>
* [Contributing]({{baseUrl}}/devGuide/devGuide.html)
* [Setting up]({{baseUrl}}/devGuide/settingUp.html)
* [Workflow]({{baseUrl}}/devGuide/workflow.html)
* Design :expanded:
  * [Project Structure]({{baseUrl}}/devGuide/design/projectStructure.html)
  * [Architecture]({{baseUrl}}/devGuide/design/architecture.html)
* [Writing Plugins]({{baseUrl}}/devGuide/writingPlugins.html)
* [Project management]({{baseUrl}}/devGuide/projectManagement.html)
* Appendices :expanded:
  * [Style guides]({{baseUrl}}/devGuide/styleGuides.html)
      </site-nav>
    </div>
  </nav>
  <div id="content-wrapper" class="fixed-header-padding">
    {{ content }}
  </div>
  <nav id="page-nav" class="fixed-header-padding">
    <div class="nav-component slim-scroll">
      {{ pageNav }}
    </div>
  </nav>
</div>

<include src="footers/footer.mbdf" />
