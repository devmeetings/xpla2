## `xp-deck`
A deck of slides.

### Children
`link[rel=import]` - *Required*. Slide to load.

### Params
- `html[xp-run-server-url]` - *Required*. Server that will run your code. Overrides any slide-specific run urls.
- `link[href]` - *Required*. URL of slide
- `link[async]` - Load asynchronously (highly recommended).
- `link[title]` - Override slide title.
- `link[root]` - Root folder (may be relative to deck location) for relative paths resolving.
- `xp-deck[back]` - A link to return to list of decks (by default doesnt display a link)

### Example
```html
<xp-deck back="index.html">
  <link async rel="import" href="slide.html" title="Short Title" />
</xp-deck>
```

## `xp-editor`
Represents a simple IDE.

### Children
`script` - *Required*. Single file in editor.

### Params
- `active` - Active tab name. Defaults to first tab
- `tree` - Should show tree instead of file tabs.
- `script[id]` - *Required*. Name of the file
- `script[src]` - Source of file to fetch (use instead of inlining content)
- `script[highlight]` - Should parse comments in this file. File should be marked.

### Example
```html
<xp-editor tree>
  <script id="index.html" type="text/html">
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>Slide 1</title>
      </head>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  </script>
  <script id="main.js" type="application/octetstream" highlight>
    //3/ 1. Hello World Function
    function helloWorld() {
      console.log()
    }
  </script>
</xp-editor>
```

## `xp-preview`
Display a preview of results when code is run. Takes files from all editors.

### Children
None

### Params
- `xp-preview[runner]` - *Required*. Type of runner that should be used to execute the code. (Allowed: `html`, `html-jsx`, `html-babel`, `html-ts`, `java`, `python`, `burger`)
- `xp-preview[no-run]` - Don't run the code automatically when the slide is loaded.
- `xp-preview[file]` - File to open in preview (defaults to `index.html`)

### Example
```html
<xp-preview runner="html"></xp-preview>
```

## `xp-annotations`
Represents slide metadata and additional content to annotations.

### Children
`header` - *Required*. Short HTML content describing current slide.
`details` - Additional info about slide (rendered as first step in annotations-wizard)
`aside` - Additional details for code annotations.

### Params
- `aside[file]` - *Required*. Name of the file
- `aside[order]` - *Required*. Additional content to display below code snippet (starting from 1).

### Example
```html
<xp-annotations>
  <header><h1>Hello Slide!</h1></header>
  <details>
    <h2>This is very important slide</h2>
    <h3>Look at this pic:</h3>
    <img src="./image.svg">
  </details>
  <aside file="index.html" order="1">
    This is additional <code>info</code> for first annotation in file <code>index.html</code>
  </aside>
</xp-annotations>
```

