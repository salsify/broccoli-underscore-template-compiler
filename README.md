# Broccoli Underscore Template Compiler

## Installation

```bash
npm install -D broccoli-underscore-template-compiler
```

## Example

```javascript
var compileTemplates = require('broccoli-underscore-template-compiler');

var templatesTree = compileTemplates('templates', {
  description: 'TemplateCompiler (appTemplates)'
});
```

## Input Format

Given the following input:

```html
<template id="firstTemplate" data-notes="This is my first template">
  <%- message %>
</template>
```

This plugin will produce an ES6 module equivalent to:

```javascript
export var firstTemplate = _.extend(_.template('\n  <%- message %>\n'), {
  metadata: {
    notes: 'This is my first template'
  }
});

export default {
  firstTemplate: firstTemplate
};
```

Each `<template>` in the source file will be available as a field in the module's
default export, as well as an exported variable of the same name, with any data
attributes on the template available under a `metadata` hash hanging off of the
resulting function.

## Configuration

### `compileTemplates(inputTree, options)`

---

`options.extensions` *{Array}* (Optional, default `['html']`)

The file extensions which should be read and compiled as templates.

## License

This project is distributed under the MIT license.
