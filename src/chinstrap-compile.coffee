path 		= require('path')
fs   		= require('fs')
mkdirp 		= require('mkdirp')
glob 		= require("glob")
program 	= require("commander")
VERSION 	= require(path.join("..", "..", "package.json")).version
chinstrap 	= require("chinstrap-engine")

program
	.version(VERSION)
	.usage("chinstrap [options] <srcDir>")
	.description("Compile one or more chinstrap-formatted templates into functions.")
	.option("-o, --output <path>", "Set target file or folder for writing.")
	.option("-e, --extension <extension>", "Explicitly declare the file extension pattern. Default is .template.html.")
	.option("-w, --wrap <wrapper>", "String containing a ***, which will be replaced with the result of the *merged* compliation.")
	.option("-p, --plain", "Return compilation results as a flat string instead of a function.")
	.option("-d, --debug", "Append a raw version of the template as a comment.")

program
	.command("* <srcDir>")
	.action (srcDir) ->
		srcDir = fs.realpathSync(srcDir)
		extension = program.extension or ".template.html"
		output = fs.realpathSync(program.output)
		target = program.target or "ChinstrapTemplates"
		fileOutput = ""
		fileglob = srcDir + "/**/*" + extension
		glob fileglob, {}, (er, files) ->
			if er
				console.error("There was an error!", er)
			else
				namedOutput = {}
				namePaths = {}
				rawTemplates = {}

				files.forEach (file) ->
					parts = file.split("/")
					filename = parts[parts.length - 1]
					name = filename.split(".")[0]
					rawTemplates[name] = fs.readFileSync(file, 'utf8')
					namePaths[name] = fs.realpathSync(file)
					compiledFn = if program.plain
						rawTemplates[name]
					else
						new Function("config", chinstrap.render(rawTemplates[name]))
					namedOutput[name] = compiledFn
				
				compiledItems = {}
				items = []

				for name, fn of namedOutput
					compiledItems[name] = fn.toString()
					items.push("'"+name+"':" + fn.toString())

				stringVersion = "{" + items.join(",") + "}"
				
				if output
					if fs.lstatSync(output).isDirectory()
						for name, fnvalue of compiledItems
							filepath = namePaths[name]
							outputPath = filepath.replace(srcDir, output).replace(extension, ".js")
							merged = "{" + name + ":" + fnvalue + "}"
							if program.debug
								merged = "/*\n\n" + rawTemplates[name] + "\n\n*/"
							mkdirp.sync(path.dirname(outputPath))
							fs.writeFileSync(outputPath, wrapString(merged, program.wrap))
					else
						fileContent = "/* Compiled by Chinstrap v#{VERSION} #{new Date()} */ \n\n#{stringVersion}"
						fileContent = wrapString(stringVersion, program.wrap)
						fs.writeFileSync(program.output, fileContent)
				else
					console.log(wrapString(stringVersion, program.wrap))
		return

wrapString = (content, wrapTemplate) ->
	if wrapTemplate
		wrapTemplate.replace("***", content)
	else
		content;

program.parse(process.argv)
