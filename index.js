var Filter = require('broccoli-filter');
var template = require('lodash-node/modern/utilities/template');

UnderscoreTemplateCompiler.prototype = Object.create(Filter.prototype);
UnderscoreTemplateCompiler.prototype.constructor = UnderscoreTemplateCompiler;

function UnderscoreTemplateCompiler(inputTree, options) {
  if (!(this instanceof UnderscoreTemplateCompiler)) return new UnderscoreTemplateCompiler(inputTree, options);

  options = options || {};

  Filter.apply(this, arguments);
}

UnderscoreTemplateCompiler.prototype.extensions = ['html'];
UnderscoreTemplateCompiler.prototype.targetExtension = 'js';

UnderscoreTemplateCompiler.prototype.processString = function(content, file) {
  var named = parseNamedTemplates(content, file);
  if (!named.length) {
    return writeSingleTemplate(templateBody(content));
  } else {
    return writeNamedTemplates(named);
  }
};

module.exports = UnderscoreTemplateCompiler;

var R_NAMED_TEMPLATE = /<(script|template)\b([^>]*)>([\s\S]*?)<\/\1>/gm;
function parseNamedTemplates(content, file) {
  var templates = [],
      match;

  while (match = R_NAMED_TEMPLATE.exec(content)) {
    templates.push({
      body: templateBody(match[3]),
      id: parseTemplateId(match[2], file),
      metadata: parseTemplateMetadata(match[2])
    });
  }

  return templates;
}

var R_ID = /id=(['"]?)(\w+?)\1/mi;
function parseTemplateId(attrString, file) {
  var id = R_ID.exec(attrString)[2];
  
  if (!id) throw new Error('Found a template missing an ID in ' + file);
  
  return id;
}

var R_DATA_ATTRIBUTE = /data-([^=]+)=(['"]?)(.+?)\2/gmi;
function parseTemplateMetadata(attrString, file) {
  var metadata = {},
      match;
  
  while (match = R_DATA_ATTRIBUTE.exec(attrString)) {
    metadata[match[1].toLowerCase()] = match[3];
  }

  return metadata;
}

function writeNamedTemplates(templates) {
  var output = [];

  templates.forEach(function(template) {
    output.push('export var ' + template.id + ' = ' + template.body);
    output.push(template.id + '.metadata = ' + JSON.stringify(template.metadata));
  });

  output.push([
    'export default Object({',
    templates.map(function(template) { return template.id + ': ' + template.id }).join(', '),
    '});'
  ].join(' '));

  return output.join(';\n');
}

var R_FUNC_BODY = /^function\s*\(.*?\)\s*\{([\s\S]*)}$/m;
function templateBody(templateString) {
  var func = template(templateString),
      body = R_FUNC_BODY.exec(func)[1];

  // Escape quotes within the string
  body = body.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  // Replace newlines with string breaks
  body = body.replace(/\n/gm, '\\n" + \n"');

  // This whole ordeal is necessary because Underscore templates use `with`, which
  // is illegal in strict mode. Manually constructing a Function instance is the only
  // semi-legit escape hatch for strict mode.
  return 'new Function("obj", "' + body + '")';
}

function writeSingleTemplate(template) {
  return [
    'var template = ' + template + ';',
    'template.metadata = {};',
    'export default template;'
  ].join('\n');
}