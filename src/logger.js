#!/usr/bin/env node
"use strict";

function Logger() {}

Logger.prototype.showResult = function(result_line) {
	console.log('\u2714 ' + result_line);
}

Logger.prototype.showError = function(error_line) {
	console.error('\u2718 ' + error_line);
}

module.exports = Logger;