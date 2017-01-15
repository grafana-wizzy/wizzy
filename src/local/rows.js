#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('temp-vars');
var Table = require('cli-table');
var _ = require('lodash');

var rowsDir = 'rows';

function Rows() {}

// Save a row under rows directory on disk
Rows.prototype.saveRow = function(rowName, content, showResult) {
	localfs.createDirIfNotExists(rowsDir, showResult);
	localfs.writeFile(getRowsFile(rowName), logger.stringify(content, null, 2));
	if (showResult) {
		logger.showResult('Row ' + rowName + ' saved successfully under rows directory.');
	}

};

// Reads row json from file.
Rows.prototype.readRow = function(rowName) {

	if (localfs.checkExists(getRowsFile(rowName))) {
		return JSON.parse(localfs.readFile(getRowsFile(rowName)));
	}
	else {
		logger.showError('Row file ' + getRowsFile(rowName) + ' does not exist.');
		process.exit();
	}

};

// Get row file name from var name
function getRowsFile(rowName) {

	return rowsDir + '/' + rowName + '.json';

}
module.exports = Rows;