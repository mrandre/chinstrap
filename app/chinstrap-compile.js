var VERSION, chinstrap, fs, glob, lib, mkdirp, path, program, wrapString;

path = require('path');

fs = require('fs');

mkdirp = require('mkdirp');

glob = require("glob");

program = require("commander");

lib = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'lib');

VERSION = require(path.join("..", "..", "package.json")).version;

chinstrap = require(path.join(lib, "chinstrap"));

program.version(VERSION).usage("chinstrap [options] <srcDir>").description("Compile one or more chinstrap-formatted templates into functions.").option("-o, --output <path>", "Set target file or folder for writing.").option("-e, --extension <extension>", "Explicitly declare the file extension pattern. Default is .template.html.").option("-w, --wrap <wrapper>", "String containing a ***, which will be replaced with the result of the *merged* compliation.").option("-p, --plain", "Return compilation results as a flat string instead of a function.").option("-d, --debug", "Append a raw version of the template as a comment.");

program.command("* <srcDir>").action(function(srcDir) {
  var extension, fileOutput, fileglob, output, target;
  srcDir = fs.realpathSync(srcDir);
  extension = program.extension || ".template.html";
  output = fs.realpathSync(program.output);
  target = program.target || "ChinstrapTemplates";
  fileOutput = "";
  fileglob = srcDir + "/**/*" + extension;
  glob(fileglob, {}, function(er, files) {
    var compiledItems, fileContent, filepath, fn, fnvalue, items, merged, name, namePaths, namedOutput, outputPath, rawTemplates, stringVersion, _results;
    if (er) {
      return console.error("There was an error!", er);
    } else {
      namedOutput = {};
      namePaths = {};
      rawTemplates = {};
      files.forEach(function(file) {
        var compiledFn, filename, name, parts;
        parts = file.split("/");
        filename = parts[parts.length - 1];
        name = filename.split(".")[0];
        rawTemplates[name] = fs.readFileSync(file, 'utf8');
        namePaths[name] = fs.realpathSync(file);
        compiledFn = program.plain ? rawTemplates[name] : new Function("config", chinstrap.render(rawTemplates[name]));
        return namedOutput[name] = compiledFn;
      });
      compiledItems = {};
      items = [];
      for (name in namedOutput) {
        fn = namedOutput[name];
        compiledItems[name] = fn.toString();
        items.push("'" + name + "':" + fn.toString());
      }
      stringVersion = "{" + items.join(",") + "}";
      if (output) {
        if (fs.lstatSync(output).isDirectory()) {
          _results = [];
          for (name in compiledItems) {
            fnvalue = compiledItems[name];
            filepath = namePaths[name];
            outputPath = filepath.replace(srcDir, output).replace(extension, ".js");
            merged = "{" + name + ":" + fnvalue + "}";
            if (program.debug) {
              merged = "/*\n\n" + rawTemplates[name] + "\n\n*/";
            }
            mkdirp.sync(path.dirname(outputPath));
            _results.push(fs.writeFileSync(outputPath, wrapString(merged, program.wrap)));
          }
          return _results;
        } else {
          fileContent = "/* Compiled by Chinstrap v" + VERSION + " " + (new Date()) + " */ \n\n" + stringVersion;
          fileContent = wrapString(stringVersion, program.wrap);
          return fs.writeFileSync(program.output, fileContent);
        }
      } else {
        return console.log(wrapString(stringVersion, program.wrap));
      }
    }
  });
});

wrapString = function(content, wrapTemplate) {
  if (wrapTemplate) {
    return wrapTemplate.replace("***", content);
  } else {
    return content;
  }
};

program.parse(process.argv);
