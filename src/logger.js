#!/usr/bin/env node
"use strict";

function Logger() {}

Logger.prototype.showResult = function(resultLine) {
	console.log('\u2714 ' + resultLine);
}

Logger.prototype.showError = function(errorLine) {
	console.error('\u2718 ' + errorLine);
}

Logger.prototype.showOutput = function(output, stringify) {
	if (stringify) {
		console.log('Output:\n' + JSON.stringify(output));
	} else {
		console.log('Output:\n' + output);
	}
}

module.exports = Logger;