# markbind-cli
Command line interface for MarkBind

## Installation
```
npm i -g markbind-cli
```

You could download the repo to refer to some example files (`src/`) for testing.

## Usage
```
  Usage: markbind [options] [command] <file>
  
  Commands:

    include <file>  process all the include in the given file
    render <file>   render the given file

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -o, --output <path>  output file path (if not present, print to )
```

## Demo (use files in `src/`)
A `test.md` file is provided to test the `include` and `render` feature. 
```
$ markbind include src/test.md -o output/test_out.md
$ markbind render output/test_out.md -o output/test_out.html
```

## Example
Print the included result to terminal.
```
$ markbind include src/test.md
```

Save the included result to `test_out.md`. (using terminal I/O)
```
$ markbind include src/test.md > test_out.md
```

Save the included result to `test_out.md`. (Using `--ouput` option)
```
$ markbind include src/test.md -o test_out.md
```

Render a markdown file after include. (Currently files are only rendered to HTML content, not site)
```
$ markbind render src/test_out.md -o test.html
```

## Supported Customized HTML Tags
1. Use `<include>` tag to include another markdown or HTML document into current context.
  
  ```
    <include src="path/to/file" />
  ```
  
  Attributes:
  - `src`: specify the source file path. Use a hash (#) followed by the segment id to include only a segment from the file.
  - `inline` (optional): make the included result an inline element.
  - `exc` (optional): exclude given segments from the included file. (Not implemented yet) 

  Examples:
  ```
    <include src="EstablishingRequirements.md#preview" inline/>
    <include src="../common/RequirementsVsSystemSpecification.md"/>
    <include src="../index.html" />
  ```

2. Use `<segment>` if you wish to have reusable fragments within a file.

  ```
     <seg id="segment1">
        Content of segment 1
     </seg>
  ```
  
  And use `include` tag to include it 
  ```
    <include src="path/to/file#segment1"/>
  ```