<variable name="title" id="title">Tweaking the Page Structure</variable>
<variable name="filename">tweakingThePageStructure</variable>

<frontmatter>
  title: "User Guide: {{ title }}"
  header: header.md
  footer: footer.md
  siteNav: userGuideSections.md
  pageNav: 3
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# Tweaking the Page Structure

<span class="lead" id="overview">**MarkBind offers several ways to easily tweak the overall structure of a page**, for example, using headers, footers, scripts, or stylesheets.</span>

<include src="syntax/frontmatter.mbdf" />

<hr><!-- ======================================================================================================= -->

<include src="syntax/pageHead.mbdf" />

<hr><!-- ======================================================================================================= -->

<include src="syntax/headers.mbdf" />

<hr><!-- ======================================================================================================= -->

<include src="syntax/footers.mbdf" />

<hr><!-- ======================================================================================================= -->

<include src="syntax/siteNavigationMenus.mbdf" />

<hr><!-- ======================================================================================================= -->

<include src="syntax/pageNavigationMenus.mbdf" />

<hr><!-- ======================================================================================================= -->

<include src="syntax/pageLayouts.mbdf" />

<hr><!-- ======================================================================================================= -->

<include src="plugins/filterTags.mbdf" />

{% from "njk/common.njk" import previous_next %}
{{ previous_next('usingPlugins', 'reusingContents') }}
