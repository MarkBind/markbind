<link rel="stylesheet" href="{{baseUrl}}/css/main.css">

<include src="../common/header.md" />

<div class="website-content">

# Including contents

1. #### Use `<include>` tag to include another markdown or HTML document into current context.

    ```
      <include src="path/to/file" />
    ```

    Attributes:
    - `src`: specify the source file path. Use a hash (#) followed by the element id to include only a segment from the file.

      You could also use a remote address to load a remote accessible page/fragment (make sure they are CORS accessible). e.g.:
      ```
      <include src="https://rawgit.com/Gisonrg/MarkBindDeploy/book/index.html" />
      ```

    - `inline` (optional): make the included result an inline element. (wrapped in `<span>` tag)

    Examples:
    ```
      <include src="EstablishingRequirements.md#preview" inline/>
      <include src="../common/RequirementsVsSystemSpecification.md"/>
      <include src="../index.html" />
    ```

    **Boilerplate files** 
    
      E.g. In `book/architecture/index.md`, 
      ```
        <include src="full.md">
      ```
    
    If a specified file e.g. `full.md` cannot be found in the local folder, Markbind will automatically check if the file exists in the `{{baseUrl}}/_boilerplates` folder.  
    
    The `_boilerplates` folder in the site's root directory can be used to store the repetitive files. For example, the `full.md` file contains the same text (including `<include src="text.md">`) and needs to be used in many places. You want the `text.md` to include to depend on the folder `full.md` is in (in this case, `book/architecture/full.md`). Instead of duplicating the file in different locations, you will only need a copy in the boilerplate directory - the final outcome is as if the file was present in the different locations.

    <br/>
    
2. #### Wrap elements inside a `<div>` or `<seg>` tag with an unique `id` if you wish to create a reusable content fragment inside a file (that could be included from other file).

   &#9888; The `id` cannot be exactly the same as a preceding heading, as `id` attributes will be added to headings for creating anchors.

    ```
       <seg id="segment1">
          Content of segment 1
       </seg>
       <div id="segment2">
          Content of segment 2
       </div>
    ```

    And use `include` tag to include it, specifying the segment (element) id with `#`.
    ```
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

<include src="../common/userGuideSections.md" />

</div>
