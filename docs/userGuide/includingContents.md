<frontmatter>
  footer: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Including contents

1. #### Use `<include>` tag to include another markdown or HTML document into current context.

    ```html
    <include src="path/to/file" />
    ```

    Attributes:
    - `src`: specify the source file path. Use a hash (#) followed by the element id to include only a segment from the file.

      You could also use a remote address to load a remote accessible page/fragment (make sure they are CORS accessible). e.g.:
      ```html
      <include src="https://rawgit.com/Gisonrg/MarkBindDeploy/book/index.html" />
      ```

    - `inline` (optional): make the included result an inline element. (wrapped in `<span>` tag)

    Examples:
    ```html
    <include src="EstablishingRequirements.md#preview" inline/>
    <include src="../common/RequirementsVsSystemSpecification.md"/>
    <include src="../index.html" />
    ```

    <br/>

2. #### Wrap elements inside a `<div>` or `<seg>` tag with an unique `id` if you wish to create a reusable content fragment inside a file (that could be included from other file).

   &#9888; The `id` cannot be exactly the same as a preceding heading, as `id` attributes will be added to headings for creating anchors.

    ```html
    <seg id="segment1">
      Content of segment 1
    </seg>
    <div id="segment2">
      Content of segment 2
    </div>
    ```

    And use `include` tag to include it, specifying the segment (element) id with `#`.
    ```html
    <include src="path/to/file#segment1"/>
    ```
<br/>

3. #### Direct reference to a MarkBind-driven project without changing the relative path is supported.

    Suppose you have a site, A, developed with MarkBind. Now, you want to include some pages from it in another site B.

    MarkBind allows you to directly clone site A inside a folder in site B (ensure the `site.json` existed for site A), and include the pages you want without change anything in site A's files. This is achieved through dynamically base url calculation.

    For example, now your site structure is:
    ```
    B/
      A/
        other.md
        site.json
      some.md (it include a file in site A, <include src="./A/other.md">)
    ```
    
    You may reference files from external directories using the following prefixes:
    ```
    ./  = Current directory
    ../ = Parent of current directory
    ../../ = Two directories backwards
    ```

4. #### Handling repetitive boilerplate files

    The `_markbind/boilerplates` folder in the site's root directory can be used to store repetitive files. You might have a file `structure.md` (that contains text such as `<include src="text.md">`) that needs to be used in many places. You want the `text.md` to be included to depend on the folder `structure.md` is supposed to be in. Instead of duplicating the file in different locations, you will only need a copy in the boilerplate directory — the final outcome is as if the file was present in the different locations.

    To specify a boilerplate file, add `boilerplate` in the attribute for `include` or `dynamic-panel`.

    E.g. In `book/architecture/architecturalStyles/index.md`,
    ```html
    <include src="structure.md" boilerplate />
    <dynamic-panel src="../structure.md" boilerplate />
    ```

    MarkBind will look for and use the file `/_markbind/boilerplates/structure.md`. Notice that this is the combination of the boilerplate directory and the file base name. The reference is location sensitive. If `structure.md` includes `text.md`, in the first case, it will use `book/architecture/architecturalStyles/text.md` while in the second case, it will use `book/architecture/text.md`.

    You may also want to organise your boilerplate files into directories or save them with another name. To specify the boilerplate file, use
    ```html
    <include src="index.md" boilerplate="print-index.md" />
    <include src="print.md" boilerplate="print/template.md" />
    ```
    In the first case, MarkBind will use `/_markbind/boilerplates/print-index.md`. In the second case, MarkBind will use `/_markbind/boilerplates/print/template.md`.

    <tip-box type="info">
    <markdown>
    Boilerplate files need `src` and `boilerplate` attributes. The value of `src` is compulsory — it should be where you want the included file to be if you have to duplicate it. The `boilerplate` value is optionally used to specify the path within the boilerplate folder. If unspecified, the file is assumed to be at `/_markbind/boilerplates/baseNameInSrc`. Else, MarkBind will look for the file at `/_markbind/boilerplates/value`.
    </markdown>
    </tip-box>

</div>
