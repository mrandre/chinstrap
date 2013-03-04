var fs            = require('fs');
var path          = require('path');
var Chinstrap     = require('../lib/chinstrap.js');
var walkdir       = require('../lib/walkdir.js');

var readFiles = function(dir) {

  var temp_files = [];
  var files =[];
  var temp_file;

  var pathResult = walkdir.sync(dir, function(path) {
    temp_files.push(path);
  });

  for (temp_file in temp_files) {
    if (/template\.html$/.test(temp_files[temp_file])) {
      files.push(temp_files[temp_file]);
    }
  }

  var names = files.map(function(file) {
    return path.basename(file, path.extname(file));
  });

  var paths = files.map(function(file) {
    return path.join(file);
  });

  var contents = paths.map(function(file) {
    return fs.readFileSync(file).toString();
  });

  var templates = {};
  names.forEach(function(name, index) {
    templates[name] = {raw: contents[index]};
  });

  return templates;

};

var compile = function(templates) {
  var name;
  for (name in templates) {
    var obj = templates[name];
    obj.compiled = Chinstrap.merge(obj.raw, null, true);
  }

};

var generateJS = function(templates, namespace) {
  var obj, temp_name;
  var hash = "//hash table\nCompiledTemplates." + namespace + ".hashTable = {\n";
  var js = "window.CompiledTemplates || (window.CompiledTemplates = {});\n";
  var templatePath = "CompiledTemplates.";

  if (typeof namespace === "string") {
    js += "CompiledTemplates." + namespace + " || (CompiledTemplates." + namespace + " = {});\n";
    templatePath = "CompiledTemplates." + namespace;
  }

  for (var name in templates) {
    obj = templates[name];
    temp_name = name.replace('.template', '');

    js += "\n\n" + templatePath + "['" + temp_name + "']" + " = function(obj){" + obj.compiled + "};\n";
    hash += "  '" + temp_name + "': " + templatePath + "['" + name.replace('.template', '') + "'],\n";
  }

  hash = hash.slice(0, -2);
  hash += "\n}";

  return js + "\n\n\n" + hash;

};

exports.run = function() {

  // Set input and output.
  var args = process.argv.slice(2);
  var dir = args[0];
  var output = args[1];
  var namespace = args[2];

  // Read the templates.
  var templates = readFiles(dir);

  // Compile the templates.
  compile(templates);

  // Generate the output file.
  var contents = generateJS(templates, namespace);

  fs.writeFile(output, contents);

};