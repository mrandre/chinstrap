#!/usr/bin/env node

var path = require('path');
var fs   = require('fs');
var glob = require("glob");
var program = require("commander");
var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
var VERSION = require(path.join("..", "package.json")).version;
var chinstrap = require(lib + "/chinstrap-compile.js");

program
	.version(VERSION)
	.usage("chinstrap [options] <fileGlob>")
	.description("Compile one or more chinstrap-formatted templates into functions.")
	.option("-o, --output <path>", "Set target file for writing.")
	.option("-e, --extension <extension>", "Explicitly declare the file extension pattern. Default is .template.html.")
	.option("-m, --merge", "Works with --target; Merge files into single file.")
	.option("-w, --wrap <wrapper>", "String containing a ***, which will be replaced with the result of the *merged* compliation.")
	.option("-p, --plain", "Return compilation results as a flat string instead of a function.");

program
	.command("* <fileglob>")
	.action(function(fileglob) {
		var extension = program.extension || ".template.html";
		var target = program.target || "ChinstrapTemplates";
		var fileOutput = "";

		glob(fileglob, {}, function (er, files) {
			if (er) {
				console.error("There was an error!", er);
			} else {
				templateOutput = {};
				namedOutput = {};

				files.forEach(function(file) {
					var parts = file.split("/");
					var filename = parts[parts.length - 1];
					var name = filename.replace(extension, '');
					if (program.plain) {
						var compiledFn = JSON.stringify(chinstrap(file));
					} else {
						var compiledFn = new Function("obj", chinstrap(file));
					}
					namedOutput[name] = compiledFn;
					templateOutput[file] = compiledFn;
				});

				var stringVersion = "{";

				for (var name in namedOutput) {	
					fn = namedOutput[name];
					stringVersion += "'"+name+"':" + fn.toString() + ",";
				}
				stringVersion += "'END':null";

				stringVersion += "}";

				//console.log(stringVersion);

				if (program.wrap) {
					fileContent = program.wrap.replace("***", stringVersion);	
				} else {
					fileContent = stringVersion;
					console.error("Not sure what to do with unmerged content.");
				}

				if (program.output) {
					fileContent = "/* Compiled by Chinstrap v" + VERSION +" " + new Date() + " */ \n\n" + fileContent;
					fs.writeFileSync(program.output, fileContent);
					console.log(fileContent);
					console.log("Wrote", program.output);
				} else {
					console.log("Write to console.");
					return JSON.stringify(fileContent);
				}
			}
		});
		return;
	})

program.parse(process.argv);

//console.log(JSON.stringify(chinstrap));


/*
var cmdsPath = path.join(__dirname, "commands");
var commands = fs.readdirSync(cmdsPath);

program.command("chinstrap <file>");

console.log(JSON.stringify(commands));

commands.forEach(function(cmd) {
	require(path.join(cmdsPath, cmd))(program);
});
*/


