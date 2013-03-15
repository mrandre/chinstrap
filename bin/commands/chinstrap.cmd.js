"use strict";

var chinstrap = require("../../lib/chinstrap")

// The `tweet` command
module.exports = function (program) {
    program
        .command("chinstrap <file>")
        .description("Compile a file")
        .option("-v, --verbose", "Verbose logging")
		.option("-o", "Output File")
        .action(function(msg, opts) {
			console.log(chinstrap);
			console.log("Called command!", msg, opts);
        });
};
