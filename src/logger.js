#!/usr/bin/env node
"use strict";

function Logger() {}

Logger.prototype.showResult = function(resultLine) {
	console.log('\u2714 ' + resultLine);
}

Logger.prototype.showError = function(errorLine) {
	console.error('\u2718 ' + errorLine);
}

module.exports = Logger;