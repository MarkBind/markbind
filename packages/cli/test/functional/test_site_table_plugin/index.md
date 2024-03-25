# Welcome to MarkBind

This is a minimalistic template. To learn more about authoring others in MarkBind, visit the [User Guide](https://markbind.org/userGuide/authoringothers.html).

---
Test regular table

| Name    | Age | Country |
|---------|-----|---------|
| John    | 28  | USA     |
| Emily   | 32  | Canada  |
| Michael | 41 | UK    |
| Sophia  | 25 | Germany|
| David   | 37  | Australia |
| Emma    | 29   | New Zealand |
---
Test regular table with include

| Name                                                              | Age | Country |
|-------------------------------------------------------------------|-----|---------|
| John                                                              | 28  | USA     |
| Emily                                                             | 32  | Canada  |
| Michael                                                           | 41 | UK    |
| Sophia                                                            | 25 | Germany|
| David                                                             | 37  | Australia |
| <span><include src="others/inclusion_inside_table.md" /></span> | 29   | New Zealand |

---
Test searchable

<m-table sortable>
| Name | Age | Country |
|------|-----|---------|
| John | 28  | USA     |
| Emily| 32  | Canada  |
| Michael | 41 | UK    |
| Sophia | 255 | Germany|
| David | 37  | Australia |
| <span><include src="others/inclusion_inside_table.md" /></span> | 29   | New Zealand |
</m-table>


---
Test sortable

<m-table sortable>
| Name | Age | Country |
|------|-----|---------|
| John | 28  | USA     |
| Emily| 32  | Canada  |
| Michael | 41 | UK    |
| Sophia | 255 | Germany|
| David | 37  | Australia |
| <span><include src="others/inclusion_inside_table.md" /></span> | 29   | New Zealand |
</m-table>

---
Test sortable with searchable

<m-table sortable searchable>
| Name | Age | Country |
|------|-----|---------|
| John | 28  | USA     |
| Emily| 32  | Canada  |
| Michael | 41 | UK    |
| Sophia | 255 | Germany|
| David | 37  | Australia |
| <span><include src="others/inclusion_inside_table.md" /></span> | 29   | New Zealand |
</m-table>

---
Test table can be included

<span><include src="others/table_to_be_included.md" /></span>

---
Test table can be included in a panel

<panel type="minimal" header="This is your header for a Panel, click me to expand!">

<span><include src="others/table_to_be_included.md" /></span>

</panel>

---
Test table can be included in a modal

<modal header="**Modal header** :rocket:" id="modal:loremipsum">

<span><include src="others/table_to_be_included.md" /></span>

</modal>

---

```{highlight-lines="2"}

<div>

    <diafsdfjnsdkjfnsdkjfskjdfnksjdfnkdfjsdkjfnsdjfksdfjksndfkjsndkfjnsdkjfnksjdnfkjsndfkjsndfknsdjkfnksjdfnkjsdnfjksdfknsdfkjsndf>

    </diafsdfjnsdkjfnsdkjfskjdfnksjdfnkdfjsdkjfnsdjfksdfjksndfkjsndkfjnsdkjfnksjdnfkjsndfkjsndfknsdjkfnksjdfnkjsdnfjksdfknsdfkjsndf>

</div>

```


<panel type="minimal" header="This is your header for a Panel, click me to expand!">

Lorem ipsum ...

</panel>


---
