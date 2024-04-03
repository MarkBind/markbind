{% set a = 123 %}
{% set lst = [1,2,[3,4]] %}

{% set subtotal = 5 %}
{% set taxRate = 0.10 %}
{% set totalTax = subtotal * taxRate %}
{% set totalAmount = subtotal + totalTax %}

{% set items = [99, 100, 101, 102] %}
{% set b,c,d = 100 %}

{% set hi = "hi" | upper %}

{% ext studentScoreboard = "userGuide/syntax/extra/scoreboard.json" %}
