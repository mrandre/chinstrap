#!/usr/bin/env node

var path = require('path');
var fs   = require('fs');
var mkdirp = require('mkdirp');
var glob = require("glob");
var program = require("commander");
var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
var VERSION = require(path.join("..", "package.json")).version;
var chinstrap = require(lib + "/chinstrap-compile.js");

program
	.version(VERSION)
	.usage("chinstrap [options] <srcDir>")
	.description("Compile one or more chinstrap-formatted templates into functions.")
	.option("-o, --output <path>", "Set target file or folder for writing.")
	.option("-e, --extension <extension>", "Explicitly declare the file extension pattern. Default is .template.html.")
	.option("-w, --wrap <wrapper>", "String containing a ***, which will be replaced with the result of the *merged* compliation.")
	.option("-p, --plain", "Return compilation results as a flat string instead of a function.")
	.option("-d, --debug", "Append a raw version of the template as a comment.");

program
	.command("* <srcDir>")
	.action(function(srcDir) {
		srcDir = fs.realpathSync(srcDir);
		var extension = program.extension || ".template.html";
		var output = fs.realpathSync(program.output);
		var target = program.target || "ChinstrapTemplates";
		var fileOutput = "";
		var fileglob = srcDir + "/**/*" + extension;
		glob(fileglob, {}, function (er, files) {
			if (er) {
				console.error("There was an error!", er);
			} else {
				namedOutput = {};
				namePaths = {};
				rawTemplates = {};

				files.forEach(function(file) {
					var parts = file.split("/");
					var filename = parts[parts.length - 1];
					var name = filename.split(".")[0];
					rawTemplates[name] = fs.readFileSync(file, 'utf8');
					namePaths[name] = fs.realpathSync(file);
					if (program.plain) {
						var compiledFn = JSON.stringify(chinstrap(file));
					} else {
						var compiledFn = new Function("obj", chinstrap(file));
					}
					namedOutput[name] = compiledFn;
				});
				
				var compiledItems = {};
				var items = [];

				for (var name in namedOutput) {	
					fn = namedOutput[name];
					compiledItems[name] = fn.toString();
					items.push("'"+name+"':" + fn.toString());
				}

				stringVersion = "{" + items.join(",") + "}";
				

				if (output) {
					if (fs.lstatSync(output).isDirectory()) {
						for (name in compiledItems) {
							var fnvalue = compiledItems[name];
							var filepath = namePaths[name];
							var outputPath = filepath.replace(srcDir, output).replace(extension, ".js");
							var merged = "{" + name + ":" + fnvalue + "}";
							if (program.debug) {
								merged = "/*\n\n" + rawTemplates[name] + "\n\n*/"	
							}
							mkdirp.sync(path.dirname(outputPath));
							fs.writeFileSync(outputPath, wrapString(merged, program.wrap));

						}
					} else {
						fileContent = "/* Compiled by Chinstrap v" + VERSION +" " + new Date() + " */ \n\n" + stringVersion;
						fileContent = wrapString(stringVersion, program.wrap);
						fs.writeFileSync(program.output, fileContent);
					}
					
				} else {
					console.log(wrapString(stringVersion, program.wrap));
				}
			}
		});
		return;
	})

function wrapString(content, wrapTemplate) {
	if (wrapTemplate) {
		return wrapTemplate.replace("***", content);	
	} else {
		return content;
	}
}

program.parse(process.argv);
