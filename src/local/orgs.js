#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('orgs');
var Table = require('cli-table');
var _ = require('lodash');

var orgsDir = 'orgs';

function Orgs() {}

// summarize the orgs
Orgs.prototype.summarize = function() {

	var self = this;

	var table = new Table({
		head: ['Org Id', 'Org Name'],
		colWidths: [25, 25]
	});

	var orgFiles = localfs.readFilesFromDir(orgsDir);
	_.each(orgFiles, function(orgFile) {
		var org = self.readOrg(localfs.getFileName(orgFile));
		table.push([org.id, org.name]);
	});

	logger.showOutput(table.toString());
	logger.showResult('Total orgs: ' + orgFiles.length);

};

// Saves an org file under orgs directory on disk
Orgs.prototype.saveOrg = function(id, org, showResult) {
	localfs.createDirIfNotExists(orgsDir, showResult);
	localfs.writeFile(getOrgFile(id), logger.stringify(org, null, 2));
	if (showResult) {
		logger.showResult('Org ' + id + ' saved successfully under orgs directory.');
	}

};

// Reads org json from file.
Orgs.prototype.readOrg = function(id) {

	if (localfs.checkExists(getOrgFile(id))) {
		return JSON.parse(localfs.readFile(getOrgFile(id)));
	}
	else {
		logger.showError('Org file ' + getOrgFile(id) + ' does not exist.');
		process.exit();
	}

};

// gets org filename
function getOrgFile(id) {
	return orgsDir + '/' + id +'.json';
}

module.exports = Orgs;