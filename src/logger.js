#!/usr/bin/env node
"use strict";

var prettyjson = require('prettyjson');

function Logger() {}

Logger.prototype.showResult = function(resultLine) {
	console.log('\u2714 ' + resultLine);
}

Logger.prototype.showError = function(errorLine) {
	console.error('\u2718 ' + errorLine);
}

Logger.prototype.showOutput = function(output) {
	console.log('Output:\n' + output);
}

module.exports = Logger;