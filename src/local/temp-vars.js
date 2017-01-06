#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('temp-vars');
var Table = require('cli-table');
var _ = require('lodash');

var tempVarsDir = 'temp-vars';

function TempVars() {}

// creates temp-vars directory if it does not exist
TempVars.prototype.createIfNotExists = function(showOutput) {
	localfs.createIfNotExists(tempVarsDir, 'dir', showOutput);
};

// checks dir status for the datasources
TempVars.prototype.checkDirStatus = function(showOutput) {

	return localfs.checkExists(tempVarsDir, 'temp-vars directory', showOutput);

};

// Save a template variable under template-variables directory on disk
TempVars.prototype.saveTemplateVar = function(varName, content, showResult) {

	localfs.writeFile(getTempVarFile(varName), logger.stringify(content, null, 2));
	if (showResult) {
		logger.showResult('Template variable ' + varName + ' saved successfully under temp-vars directory.');
	}

};

// Reads template variable json from file.
TempVars.prototype.readTemplateVar = function(varName) {

	if (localfs.checkExists(getTempVarFile(varName))) {
		return JSON.parse(localfs.readFile(getTempVarFile(varName)));
	}
	else {
		logger.showError('Template variable file ' + getTempVarFile(varName) + ' does not exist.');
		process.exit();
	}

};

// Get temp-var file name from var name
function getTempVarFile(varName) {

	return tempVarsDir + '/' + varName + '.json';

}

module.exports = TempVars;