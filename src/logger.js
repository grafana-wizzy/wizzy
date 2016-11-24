#!/usr/bin/env node
"use strict";

var colors = require('colors');

function Logger() {}

Logger.prototype.showResult = function(resultLine) {
	console.log('\u2714 '.green + resultLine.green);
}

Logger.prototype.showError = function(errorLine) {
	console.error('\u2718 '.red + errorLine.red);
}

Logger.prototype.showOutput = function(output) {
	console.log('Output:\n'.yellow + output.yellow);
}

Logger.prototype.stringify = function(obj) {
	return JSON.stringify(obj, null, 2);
}

module.exports = Logger;