{% include "_markbind/layouts/headers/header.md" %}

<div id="flex-body">
  <nav id="site-nav">
    <div class="site-nav-top">
      <div class="fw-bold mb-2" style="font-size: 1.25rem;">
        User Guide
      </div>
    </div>
    <div class="nav-component slim-scroll">
      <site-nav>
* [Getting Started]({{baseUrl}}/userGuide/gettingStarted.html)
* Authoring Contents :expanded:
  * [Overview]({{baseUrl}}/userGuide/authoringContents.html)
  * [Adding Pages]({{baseUrl}}/userGuide/addingPages.html)
  * [MarkBind Syntax Overview]({{baseUrl}}/userGuide/markBindSyntaxOverview.html)
  * [Formatting Contents]({{baseUrl}}/userGuide/formattingContents.html)
  * [Using Components]({{baseUrl}}/userGuide/usingComponents.html) :expanded:
    * [Presentation]({{baseUrl}}/userGuide/components/presentation.html)
    * [Images & Diagrams]({{baseUrl}}/userGuide/components/imagesAndDiagrams.html)
    * [Pop-Ups]({{baseUrl}}/userGuide/components/popups.html)
    * [Navigation]({{baseUrl}}/userGuide/components/navigation.html)
    * [Others]({{baseUrl}}/userGuide/components/others.html)
    * [Advanced]({{baseUrl}}/userGuide/components/advanced.html)
  * [Using HTML, JavaScript, CSS]({{baseUrl}}/userGuide/usingHtmlJavaScriptCss.html)
  * [Tweaking the Page Structure]({{baseUrl}}/userGuide/tweakingThePageStructure.html)
  * [Reusing Contents]({{baseUrl}}/userGuide/reusingContents.html)
* Working with Sites :expanded:
  * [Overview]({{baseUrl}}/userGuide/workingWithSites.html)
  * [Setting Site Properties]({{baseUrl}}/userGuide/settingSiteProperties.html)
  * [Using Plugins]({{baseUrl}}/userGuide/usingPlugins.html)
  * [Making the Site Searchable]({{baseUrl}}/userGuide/makingTheSiteSearchable.html)
  * [Applying Themes]({{baseUrl}}/userGuide/themes.html)
  * [Deploying the Site]({{baseUrl}}/userGuide/deployingTheSite.html)
  * [MarkBind in the Project Workflow]({{baseUrl}}/userGuide/markBindInTheProjectWorkflow.html)
  * [Redirecting to a Custom 404 Page]({{baseUrl}}/userGuide/redirectingToACustom404Page.html)
  * [Adding Navigation Buttons]({{baseUrl}}/userGuide/addingNavigationButtons.html)
  * [Templates]({{baseUrl}}/userGuide/templates.html)
* References :expanded:
  * [CLI Commands]({{baseUrl}}/userGuide/cliCommands.html)
  * [Reader-Facing Features]({{baseUrl}}/userGuide/readerFacingFeatures.html)
  * [Syntax Reference]({{baseUrl}}/userGuide/syntaxReference.html)
  * [`site.json` File]({{baseUrl}}/userGuide/siteJsonFile.html)
  * [`.gitignore` File]({{baseUrl}}/userGuide/gitignoreFile.html)
  * [Tips & Tricks]({{baseUrl}}/userGuide/tipsAndTricks.html)
  * [Troubleshooting]({{baseUrl}}/userGuide/troubleshooting.html)
  * [Glossary]({{baseUrl}}/userGuide/glossary.html)
      </site-nav>
    </div>
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
