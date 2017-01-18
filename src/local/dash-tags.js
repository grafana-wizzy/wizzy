#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('dash-tags');
var _ = require('lodash');

var dashTagsDir = 'dash-tags';

function DashTags() {}

// Save dashboard tags under dash-tags directory on disk
DashTags.prototype.saveDashTags = function(varName, content, showResult) {
	localfs.createDirIfNotExists(dashTagsDir, showResult);
	localfs.writeFile(getDashTagsFile(varName), logger.stringify(content, null, 2));
	if (showResult) {
		logger.showResult('Dashboard tags ' + varName + ' saved successfully under dash-tags directory.');
	}

};

// Reads dashboard tags json from file.
DashTags.prototype.readDashTags = function(varName) {

	if (localfs.checkExists(getDashTagsFile(varName))) {
		return JSON.parse(localfs.readFile(getDashTagsFile(varName)));
	}
	else {
		logger.showError('Dashboard tags variable file ' + getDashTagsFile(varName) + ' does not exist.');
		process.exit();
	}

};

// Get dash-tags file name from var name
function getDashTagsFile(varName) {

	return dashTagsDir + '/' + varName + '.json';

}

module.exports = DashTags;