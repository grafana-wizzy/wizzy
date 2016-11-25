#!/usr/bin/env node
"use strict";

var colors = require('colors');

function Logger(name) {
	this.name = name;
}

Logger.prototype.showResult = function(resultLine) {
	console.log('\u2714 '.green + resultLine.cyan);
}

Logger.prototype.showError = function(errorLine) {
	console.error('\u2718 '.red + errorLine.cyan);
}

Logger.prototype.showOutput = function(output) {
	console.log('Output:\n'.cyan + output.yellow);
}

Logger.prototype.stringify = function(obj) {
	return JSON.stringify(obj, null, 2);
}

Logger.prototype.debug = function(resultLine) {
	console.log('\u2714 ' + this.name + ': ' + resultLine);
}

Logger.prototype.justShow = function(line) {
	console.log(line.yellow);
}

module.exports = Logger;