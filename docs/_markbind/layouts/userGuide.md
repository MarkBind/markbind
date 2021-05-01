<include src="headers/header.mbdf" />

<div id="flex-body">
  <nav id="site-nav" class="fixed-header-padding">
    <div class="site-nav-top">
      <div class="font-weight-bold mb-2" style="font-size: 1.25rem;">User Guide</div>
    </div>
    <div class="nav-component slim-scroll">
      <site-nav>
* [**Getting Started**]({{baseUrl}}/userGuide/gettingStarted.html)
* **Authoring Contents** :expanded:
  * [Overview]({{baseUrl}}/userGuide/authoringContents.html)
  * [Adding Pages]({{baseUrl}}/userGuide/addingPages.html)
  * [MarkBind Syntax Overview]({{baseUrl}}/userGuide/markBindSyntaxOverview.html)
  * [Formatting Contents]({{baseUrl}}/userGuide/formattingContents.html)
  * [Using Components]({{baseUrl}}/userGuide/usingComponents.html)
  * [Using HTML, JavaScript, CSS]({{baseUrl}}/userGuide/usingHtmlJavaScriptCss.html)
  * [Tweaking the Page Structure]({{baseUrl}}/userGuide/tweakingThePageStructure.html)
  * [Reusing Contents]({{baseUrl}}/userGuide/reusingContents.html)
* **Working with sites** :expanded:
  * [Overview]({{baseUrl}}/userGuide/workingWithSites.html)
  * [Setting Site Properties]({{baseUrl}}/userGuide/settingSiteProperties.html)
  * [Using Plugins]({{baseUrl}}/userGuide/usingPlugins.html)
  * [Making the Site Searchable]({{baseUrl}}/userGuide/makingTheSiteSearchable.html)
  * [Applying Themes]({{baseUrl}}/userGuide/themes.html)
  * [Deploying the Site]({{baseUrl}}/userGuide/deployingTheSite.html)
  * [MarkBind in the Project Workflow]({{baseUrl}}/userGuide/markBindInTheProjectWorkflow.html)
* **References** :expanded:
  * [CLI Commands]({{baseUrl}}/userGuide/cliCommands.html)
  * [Reader-Facing Features]({{baseUrl}}/userGuide/readerFacingFeatures.html)
  * [Full Syntax Reference]({{baseUrl}}/userGuide/fullSyntaxReference.html)
  * [Syntax Cheat Sheet]({{baseUrl}}/userGuide/syntaxCheatSheet.html)
  * [`site.json` File]({{baseUrl}}/userGuide/siteJsonFile.html)
  * [Tips & Tricks]({{baseUrl}}/userGuide/tipsAndTricks.html)
  * [Glossary]({{baseUrl}}/userGuide/glossary.html)
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
