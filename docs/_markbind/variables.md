{% set markbind_blue = "#00B0F0" %}
{% set icon_arrow_down = ":fas-arrow-down:" %}
{% set icon_arrow_right = ":fas-arrow-right:" %}
{% set icon_check_blue = "<span style='color: {{ markbind_blue }}'>:fas-check-circle:</span>" %}
{% set icon_bulb_blue = "<span style='color: {{ markbind_blue }}'>:fas-lightbulb:</span>" %}
{% set icon_dislike = ":fas-thumbs-down:" %}
{% set icon_embedding = "<md>:glyphicon-log-in:</md>" %}
{% set icon_example = "++<span class='badge rounded-pill bg-secondary' style='padding-bottom: 4px; margin-right: 5px;'>Example</span>++" %}
{% set icon_examples = "++<span class='badge rounded-pill bg-secondary' style='padding-bottom: 4px;'>Examples</span>++" %}
{% set icon_info = ":fas-info-circle:" %}
{% set icon_ticked = ":far-check-square:" %}

{% set node_version_number = "16" %}
{% set node_dev_version_number = "16.19.1" %}
{% set node_version = "<tooltip content='MarkBind aims to support up to the last maintenance lts release as outlined [here](https://nodejs.org/en/about/releases/)'>v{{ node_version_number }}</tooltip>" %}
{% set node_dev_version = "<tooltip content='MarkBind aims to support up to the last maintenance lts release as outlined [here](https://nodejs.org/en/about/releases/)'>v{{ node_dev_version_number }}</tooltip>" %}
{% set link_live_preview = "[live preview](glossary.html#live-preview)" %}

{% set tooltip_root_directory = "<tooltip content='The directory that contains all the project files. It is also the directory in which the `site.json` configuration file is located.'>root directory</tooltip>" %}
