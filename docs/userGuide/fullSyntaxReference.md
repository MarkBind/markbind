<frontmatter>
  title: "User Guide: Full Syntax Reference"
  layout: userGuide.md
</frontmatter>

# Full Syntax Reference

{% set syntax_topics = {
  headings : ['Headings', ['basic', 'reader-facing']],
  paragraphs : ['Paragraphs', ['basic']],
  lineBreaks : ['Line Breaks', ['basic']],
  textStyles : ['Text Styles', ['basic', 'reader-facing']],
  blockquotes: ['Blockquotes', ['basic', 'reader-facing']],
  lists : ['Lists', ['basic', 'reader-facing']],
  code : ['Code', ['basic', 'reader-facing']],
  horizontalrules : ['Horizontal Rules', ['basic', 'reader-facing']],
  links : ['Links', ['basic', 'reader-facing']],
  footnotes: ['Footnotes', ['basic', 'reader-facing']],
  images : ['Images', ['basic', 'reader-facing']],
  attributes: ['Classes, Attributes & Identifiers', ['basic', 'reader-facing']],
  tables : ['Tables', ['basic', 'reader-facing']],
  emoji : ['Emoji', ['basic', 'reader-facing']],
  icons : ['Icons', ['basic', 'reader-facing']],
  embeds : ['Embeds', ['basic', 'reader-facing']],
  dates : ['Dates', ['basic', 'reader-facing']],
  mathformulae : ['Math Formulae', ['basic', 'reader-facing']],

  frontmatter : ['Front Matter', ['other']],
  includes : ['Includes', ['other']],
  keywords : ['Keywords', ['other']],
  tags : ['Tags', ['other']],
  variables : ['Variables', ['other']],

  badges : ['Badges', ['presentation', 'reader-facing']],
  boxes : ['Boxes', ['presentation', 'reader-facing']],
  panels : ['Panels', ['presentation', 'reader-facing']],
  tabs : ['Tabs', ['presentation', 'reader-facing']],
  pictures : ['Pictures', ['images-diagrams', 'reader-facing']],
  thumbnails : ['Thumbnails', ['images-diagrams', 'reader-facing']],
  diagrams : ['Diagrams', ['images-diagrams', 'reader-facing']],
  tooltips : ['Tooltips', ['popups', 'reader-facing']],
  popovers : ['Popovers', ['popups', 'reader-facing']],
  modals : ['Modals', ['popups', 'reader-facing']],
  dropdowns : ['Dropdowns', ['navigation', 'reader-facing']],
  searchBars : ['Search Bars', ['navigation', 'reader-facing']],
  navBars : ['Nav Bars', ['navigation', 'reader-facing']],
  siteNavigationMenus : ['Site Navigation Menus', ['navigation', 'reader-facing']],
  pageNavigationMenus : ['Page Navigation Menus', ['navigation', 'reader-facing']],
  questions : ['Questions and Quizzes', ['others', 'reader-facing']]
} %}

{% for topic in syntax_topics | dictsort %}
<panel type="seamless" header="###### **{{ topic[1][0] }}**">
  <include src="syntax/{{ topic[0] }}.md" />
</panel>
{% endfor %}
