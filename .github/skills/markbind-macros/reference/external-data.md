# External Data with Nunjucks

## Import JSON/CSV

```html
{% ext config = "data/config.json" %}
{% ext users = "data/users.csv" %}
```

## Usage

```html
{{ config.siteName }}
{% for user in users %}
* {{ user.name }} - {{ user.email }}
{% endfor %}
```

## Notes

- Supported file formats: `.json`, `.csv`
- CSV without header can use `noHeader` option

## User Guide Source

- <https://markbind.org/userGuide/syntax/variables.html>
