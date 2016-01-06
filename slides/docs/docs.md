# XPla Slide Docs

##`xp-editor`
Represents a simple IDE.

### Children
`script` - *Required*. Single file in editor.

### Params
`active` - Active tab name. Defaults to first tab
`script[id]` - *Required*. Name of the file
`script[highlight]` - Lines that should be highlighted in editor

### Example
```html
<xp-editor>
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
  <script id="main.js" type="application/octetstream" highlight="1-2,3">
    function helloWorld() {
      console.log()
    }
  </script>
</xp-editor>
```

## `xp-preview`
Display a preview of results when code is run. Takes files from all editors.

## Children
None

## Params
`xp-preview[runner]` - *Required*. Type of runner that should be used to execute the code. (Allowed: `html`)
`xp-preview[no-run]` - Don't run the code automatically when the slide is loaded.

## Example
```html
<xp-preview runner="html"></xp-preview>
```
