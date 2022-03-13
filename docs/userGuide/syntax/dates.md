## Dates

{% macro njcode(raw) %}<code>{<a/>{ {{ raw }} }}</code>{% endmacro %}
{% macro njblock(raw) %}<code>{<a/>% {{ raw }} %}</code>{% endmacro %}

**Markbind supports date formatting and simple calculations** as a Nunjucks [filter](https://mozilla.github.io/nunjucks/templating.html#filters).

**Syntax:** {{ njcode('baseDate | date(format, daysToAdd)') }}

<div id="main-example">

20 days after 1st Jan 2020:

{{ njcode('"2020-01-01" | date("ddd, Do MMM, YYYY", 20) ') }} :glyphicon-arrow-right: {{ "2020-01-01" | date("ddd, Do MMM, YYYY", 20) }}
</div>

<box type="info">

The baseDate follows the format: `YYYY-MM-DD`

The default output format is `"ddd D MMM"` e.g. Fri 6 Mar
</box>

### Using variables

{{ njblock('set base1 = "2020-01-01"') }} {% set base1 = "2020-01-01" %} <br/>
{{ njblock('set format1 = "DD MM YYYY"') }} {% set format1 = "DD MM YYYY" %} <br/>
{{ njblock('set format2 = "ddd Do MMM (DD/MM/YYYY)"') }} {% set format2 = "ddd Do MMM (DD/MM/YYYY)" %}

{{ njcode('base1 | date') }} :glyphicon-arrow-right: {{ base1 | date }}<br/>

#### Custom formatting
{{ njcode('base1 | date(format1)') }} :glyphicon-arrow-right: {{ base1 | date(format1) }}<br/>

#### Adding days
{{ njcode('base1 | date(format2, 0)') }} :glyphicon-arrow-right: {{ base1 | date(format2, 0) }}<br/>
{{ njcode('base1 | date(format2, 10)') }} :glyphicon-arrow-right: {{ base1 | date(format2, 10) }}<br/>

#### Page variables
Dates can be supplied using [page variables](../reusingContents.html#variables) for convenience.

Inside `variables.md` or referencing page:
```
{% raw %}{% set date_pagevar = "2020-03-06" %}{% endraw %}
```
{% set date_pagevar = "2020-03-06" %}

{{ njcode('date_pagevar | date(format2)') }} :glyphicon-arrow-right: {{ date_pagevar | date(format2) }} <br/>



### Advanced Formatting

The output date can be formatted to suit your needs by specifying a format string as an argument to the date filter.

Default format: `"ddd D MMM"` e.g. Fri 6 Mar

<panel header="**Brief reference**">

Token | Output
- | -
D | 1
Do | 1st
DD | 01
M | 1
MM | 01
MMM | Jan
MMMM | January
YY | 19
YYYY | 2019
</panel>

Full formatting reference available [here](https://momentjs.com/docs/#/displaying/format/).

{{ icon_example }}
<span id="examples" class="d-none">
<include boilerplate src="outputBox.md">
<span id="code">

<box><span>
{{ njblock('set base1 = "2019-08-12"') }}<br/>
{{ njblock('set format1 = "DD MM YYYY"') }}<br/>
{{ njblock('set format2 = "ddd Do MM"') }}<br/>
{{ njcode('base1 | date') }} `<!-- Mon 12 Aug -->`<br/>
{{ njcode('base1 | date(format1)') }} `<!-- 12 08 2019 -->`<br/>
{{ njcode('base1 | date(format1, 10)') }} `<!-- 22 08 2019 -->`<br/>
{{ njcode('base1 | date(format2, 10)') }} `<!-- Thu 22/08 -->`<br/>
</span></box>

</span>
<span id="output">
Mon 12 Aug<br/>
12 08 2019<br/>
22 08 2019<br/>
Thu 22/08
</span>
</include>

<span id="short" class="d-none">

<box><span>
{{ njcode('"2019-08-12" | date("DD.MM.YYYY", 10)') }} `<!-- 22.08.2019 -->`<br/>
</span></box>

{{ "2019-08-12" | date("DD.MM.YYYY", 10) }}
</span>
</span>
