The `_markbind/boilerplates` folder in the site's root directory can be used to store repetitive files. You might have a file `structure.md` (that contain text such as `<include src="text.md">`) that needs to be used in many places. You want the `text.md` to include to depend on the folder `structure.md` is supposed to be in (in this case, `book/architecture/full.md`). Instead of duplicating the file in different locations, you will only need a copy in the boilerplate directory - the final outcome is as if the file was present in the different locations.

To specify a boilerplate file, add `boilerplate` in the attribute for `include` and `dynamic-panel`.

E.g. In `book/architecture/architecturalStyles/index.md`,
```html
  <dynamic-panel src="structure.md" boilerplate />
  <include src="../structure.md" boilerplate />
```

MarkBind will look for and use the file `/_markbind/boilerplates/structure.md`. Notice that this is the combination of the boilerplate directory and the file base name. The reference is location sensitive. If `structure.md` includes `text.md`, in the first case, it will use `book/architecture/architecturalStyles/text.md` while in the second case, it will use `book/architecture/text.md`.

You may also want to organise your boilerplate files into directories or save them with another name. To specify the boilerplate file, use
```html
  <include src="index.md" boilerplate="print-index.md" />
  <include src="print.md" boilerplate="print/template.md" />
```
In the first case, Markbind will use `/_markbind/boilerplates/print-index.md`. In the second case, Markbind will use `/_markbind/boilerplates/print/template.md`.

<tip-box type="info">
<markdown>
Boilerplates files need `src` and `boilerplate` attributes. The value of `src` is compulsory - it should be where you want the included file to be if you have to duplicate it. The `boilerplate` value is optionally used to specify the path within the boilerplate folder. If unspecified, the file is assumed to be at `/_markbind/boilerplates/baseNameInSrc`. Else, Markbind will look for the file at `/_markbind/boilerplates/value`.
</markdown>
</tip-box>
