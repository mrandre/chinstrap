var fs            = require('fs');
var chinstrap     = require('./chinstrap.js');


module.exports = function(file, target) {
	var content = fs.readFileSync(file).toString();

	if (content.match("{{")) {
		compiled = chinstrap.merge(content, null, true);
	} else {
		compiled = content;
	}

	return compiled;
};
