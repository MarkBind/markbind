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

  badges : ['Badges', ['component', 'reader-facing']],
  boxes : ['Boxes', ['component', 'reader-facing']],
  diagrams : ['Diagrams', ['component', 'reader-facing']],
  dropdowns : ['Dropdowns', ['component', 'reader-facing']],
  modals : ['Modals', ['component', 'reader-facing']],
  navBars : ['Nav Bars', ['component', 'reader-facing']],
  panels : ['Panels', ['component', 'reader-facing']],
  pictures : ['Pictures', ['component', 'reader-facing']],
  popovers : ['Popovers', ['component', 'reader-facing']],
  questions : ['Questions and Quizzes', ['component', 'reader-facing']],
  searchBars : ['Search Bars', ['component', 'reader-facing']],
  tabs : ['Tabs', ['component', 'reader-facing']],
  thumbnails : ['Thumbnails', ['component', 'reader-facing']],
  tooltips : ['Tooltips', ['component', 'reader-facing']],
  siteNavigationMenus : ['Site Navigation Menus', ['component', 'reader-facing']],
  pageNavigationMenus : ['Page Navigation Menus', ['component', 'reader-facing']]
} %}

{% for topic in syntax_topics | dictsort %}
<panel type="seamless" header="###### **{{ topic[1][0] }}**">
  <include src="syntax/{{ topic[0] }}.mbdf" />
</panel>
{% endfor %}
