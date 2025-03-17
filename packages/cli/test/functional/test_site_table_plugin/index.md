# Welcome to MarkBind

This is to test data tables.

---
Test searchable

<d-table searchable>
| Name | Age | Country |
|------|-----|---------|
| John | 28  | USA     |
| Emily| 32  | Canada  |
| Michael | 41 | UK    |
| Sophia | 255 | Germany|
| David | 37  | Australia |
| <span><include src="others/inclusionInsideTable.md" /></span> | 29   | New Zealand |
</d-table>


---
Test sortable

<d-table sortable>
| Name | Age | Country |
|------|-----|---------|
| John | 28  | USA     |
| Emily| 32  | Canada  |
| Michael | 41 | UK    |
| Sophia | 255 | Germany|
| David | 37  | Australia |
| <span><include src="others/inclusionInsideTable.md" /></span> | 29   | New Zealand |
</d-table>

---
Test sortable with searchable

<d-table sortable searchable>
| Name | Age | Country |
|------|-----|---------|
| John | 28  | USA     |
| Emily| 32  | Canada  |
| Michael | 41 | UK    |
| Sophia | 255 | Germany|
| David | 37  | Australia |
| <span><include src="others/inclusionInsideTable.md" /></span> | 29   | New Zealand |
</d-table>

---
Test table can be included

<include src="others/tableToBeIncluded.md" />

---
Test table can be included in a panel

<panel type="minimal" header="This is your header for a Panel, click me to expand!">

<include src="others/tableToBeIncluded.md" />

</panel>

---
Test table can be included in a modal

<trigger for="modal:loremipsum">trigger</trigger>
<modal header="**Modal header** :rocket:" id="modal:loremipsum">

<include src="others/tableToBeIncluded.md" />

</modal>

---
