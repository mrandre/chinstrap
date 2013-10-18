Chinstrap
=========

Note that Chinstrap has no dependencies in the compiler.

```coffeescript

module.exports = ( ->

	class Chinstrap

```

Basic Setup
-----------

*Value: open*

The opener is the string pattern that marks the beginning of a code block. Default is {{

*Value: close*

The closer is the string pattern taht marks the end of a code block. Default is }}.


```coffeescript

		open: "{{"
		close: "}}"

```

*Methods: setOpen and setClose*

Two methods to override the opne and close values.

```coffeescript

		setOpen: (@open) ->

		setClose: (@close) ->

```

Main Execution Code
-------------------

*Method: merge*

The main method to call when using Chinstrap. 

Receives three arguments: 

```coffeescript

		merge: (template, data, returnSource) ->
			returnSource = typeof returnSource isnt 'undefined' and returnSource
			template = @render(template)
			fn = new Function("obj", template)
			if returnSource then str else fn(data)

```

*Method: render (String str)*

Workhorse method; converts the template into a function.

```coffeescript

		render: (str) ->
			str = @stripWhiteSpace(str)
			str = @replaceOpenChars(str)
			str = str.replace(/((^|\}\})[^\t]*)'/g, "$1\r")
			str = @replaceQmarkWithIfOpen(str)
			str = str.replace(/\t\s?\@\=(.*?)\}\}/g, "\titerator=$1;\n}}")
			str = str.replace(/\t\s?WHILE(.*?)\}\}/g, "\twhile ($1) {\n}}")
			str = str.replace(/\t\s?\/WHILE(.*?)\}\}/g, "\t}\n}}")
			str = str.replace(/\t\s?FOR(.*?)\}\}/g, "\tfor ($1) {\n}}")
			str = str.replace(/\t\s?%(.*?)\}\}/g,"', this.merge($1), '")
			str = str.replace(/\t\s?\/FOR(.*?)\}\}/g, "\t}\n}}")
			str = str.replace(/\t\s?(IF|\?)(.*?)\}\}/g, "\tif (value($2)) {\n}}")
			str = str.replace(/\t\s?\/(IF|\?)(.*?)\}\}/g, "\t}\n}}")
			str = str.replace(/\t\s?(\-\?|ELSEIF)(.*?)\}\}/g, "\t} else if (value($2)) {\n}}")
			str = str.replace(/\t\s?(\-|ELSE)(.*?)\}\}/g, "\t} else {\n}}")
			str = str.replace(/\@\@/g, "iterator")
			str = str.replace(/\@/g, "iterator.")
			str = str.split("\t").join("');\n")
			str = str.split(@close).join("p.push('")
			str = str.split("\r").join("\\'")
			str = "\nvar p=[],iterator = {},print=function(){p.push.apply(p,arguments);},value = function(val){if (typeof val == 'function') {return val.apply(iterator);} else {return val;}};\nwith(obj){\np.push('" + str + "');\n}\nreturn p.join('');\n"
```

String Manipulation Functions
-----------------------------

*Method: stripWhiteSpace*

The conceit of the Resig system is to remove lots of white space characters, and then use those characters as drop-ins for action items.

So step one is to remove tabs and returns, and replace them with a blank space.

```coffeescript

		stripWhiteSpace: (str) -> str.replace(/[\r\t\n]/g, " ")

```

*Method: replaceOpenChars*

Chinstrap executes snippets of code that live between an open and close character. The default opener is "{{".

Now replace the open character (default "{{") with a tab character ("\t"). We'll use this to put the function back together later.

```coffeescript

		replaceOpenChars: (str) -> str.split(@open).join("\t")

```

*Replace ? with if statement*

You can write an if statement in two alternate styles.

```coffeescript

		replaceQmarkWithIfOpen: (str) -> str.replace(/\t\s?=(.*?)\}\}/g, "',value($1),'")

```

```coffeescript

		compileWhileOpen: (str) ->

		compileWhileClose: (str) ->

		compileForOpen: (str) ->

		compileForClose: (str) ->

	new Chinstrap()
)()
```
