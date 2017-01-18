#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('temp-vars');
var Table = require('cli-table');
var _ = require('lodash');

var panelsDir = 'panels';

function Panels() {}

// Save a panel under panels directory on disk
Panels.prototype.savePanel = function(panelName, content, showResult) {
	localfs.createDirIfNotExists(panelsDir, showResult);
	localfs.writeFile(getPanelsFile(panelName), logger.stringify(content, null, 2));
	if (showResult) {
		logger.showResult('Panel ' + panelName + ' saved successfully under panels directory.');
	}

};

// Reads panel json from file.
Panels.prototype.readPanel = function(panelName) {
	if (localfs.checkExists(getPanelsFile(panelName))) {
		return JSON.parse(localfs.readFile(getPanelsFile(panelName)));
	}
	else {
		logger.showError('Panel file ' + getPanelsFile(panelName) + ' does not exist.');
		process.exit();
	}
};

// Get panels file name from panel name
function getPanelsFile(panelName) {

	return panelsDir + '/' + panelName + '.json';

}

module.exports = Panels;