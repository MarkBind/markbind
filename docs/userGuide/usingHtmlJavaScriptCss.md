{% set title = "Using HTML, JavaScript, CSS" %}
{% set filename = "usingHtmlJavaScriptCss" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
  pageNav: 2
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div id="overview" class="lead">

**A MarkBind source file can contain a mixture of HTML, JavaScript, and CSS** as a normal web page would.
</div>

## Markdown in HTML
==Text within HTML tags are considered plain text unless the text is preceded by a blank line,== in which case the text is parsed as Markdown text.

<div class="indented">

{{ icon_example }} Here is an example of how text within an html tag is parsed as Markdown when preceded by a blank line.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<div>
Without preceding blank line: Apples **Bananas** Cherries
</div>

<div>

With preceding blank line: Apples **Bananas** Cherries
</div>
</variable>
</include>

</div>

Alternatively, you can use `<markdown>` (for _block_ Markdown elements such as headings) or `<md>` (for _inline_ Markdown elements such as bold/italic text) tags to indicate the text should be treated as Markdown.

<div class="indented">

{{ icon_example }} Here is an example of how text within an HTML tag can be treated as Markdown using `<markdown>`/`<md>` tags.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<div>
<md>Apples **Bananas** Cherries</md>
</div>

<div>
<markdown>##### Apples **Bananas** Cherries</markdown>
</div>
</variable>
</include>

</div>

## JavaScript chart libraries
Popular chart libraries such as [Chart.js](https://www.chartjs.org/) and [Apache ECharts](https://echarts.apache.org) can be used in MarkBind to create beautiful charts, similar to how they are used in any HTML web page. The details of how to use these libraries are beyond the scope of this section, but you can find more infomration on their websites. In general, you will perform these 3 steps:
1. Import the library via a CDN or locally.
1. Specify a target HTML element to render the chart.
1. Initialize the chart with the data and options.

<box type="warning">

As mentioned in the [above section](#markdown-in-html), you **should not** leave any blank lines within HTML elements unintentionally, to prevent misinterpreting them as Markdown instead of code/text.
</box>

{{ icon_example }} Here is an example of how to use Chart.js to create a Pie chart.

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">HTML</variable>
<variable name="code">

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js"></script>
<div style="width:400px;height:400px;">
  <canvas id="myChart"></canvas>
</div>
<script>
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3],
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)'
            ]
        }]
    }
});
</script>
</variable>
</include>

{{ icon_example }} Here is an example of how to use Apache ECharts to create a Bar chart.

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">HTML</variable>
<variable name="code">
<script src="https://cdn.jsdelivr.net/npm/echarts@5.3.2/dist/echarts.js"></script>
<div id="echart" style="width:400px;height:400px;"></div>
<script type="text/javascript">
  // Initialize the echarts instance based on the prepared dom
  var eChart = echarts.init(document.getElementById('echart'));
  // Specify the configuration items and data for the chart
  var option = {
    title: {
      text: 'ECharts Getting Started'
    },
    xAxis: {
      data: ['Shirts', 'Cardigans', 'Chiffons']
    },
    tooltip: {},
    yAxis: {},
    series: [
      {
        name: 'sales',
        type: 'bar',
        data: [5, 20, 36]
      }
    ]
  };
  // Display the chart using the configuration items and data just specified.
  eChart.setOption(option);
</script>
</variable>
</include>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('components/advanced', 'tweakingThePageStructure') }}
