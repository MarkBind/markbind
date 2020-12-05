## Dates
{% set base1 = "2019-08-12" %}

{% set format1 = "DD MM YYYY" %}

{% set format2 = "ddd DD/MM" %} 


{{ base1 | date }} should be Mon 12 Aug

{{ base1 | date(format1) }} should be 12 08 2019

{{ base1 | date(format1, 10) }} should be 22 08 2019

{{ base1 | date(format2, 10) }} should be Thu 22/08


{{ base2 | date }} should be Tue 1 Jan

{{ base2 | date(format1) }} should be 01 01 2019

{{ base2 | date(format1, 10) }} should be 11 01 2019

{{ base2 | date(format2, 10) }} should be Fri 11/01

{{ formatted_date }} should be Fri 11 Jan
