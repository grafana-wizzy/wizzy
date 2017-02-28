#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('alerts');
var Table = require('cli-table');
var _ = require('lodash');

var alertDir = 'alerts';

function Alerts() {}

// summarize the alerts
Alerts.prototype.summarize = function() {

	var self = this;

	var table = new Table({
  	head: ['Alert Name'],
		colWidths: [30]
	});

	var dsFiles = localfs.readFilesFromDir(alertDir);

	_.each(dsFiles, function(dsFile) {
		var ds = self.read(localfs.getFileName(dsFile));
		table.push([ds.name]);
	});

	logger.showOutput(table.toString());
	logger.showResult('Total alerts: ' + dsFiles.length);

};

// Saves a alert file under alerts directory on disk
Alerts.prototype.save = function(id, alert, showResult) {
	localfs.createDirIfNotExists(alertDir, showResult);
	localfs.writeFile(getAlertFile(id), logger.stringify(alert, null, 2));
	if (showResult) {
		logger.showResult('Alert ' + id + ' saved successfully under alerts directory.');
	}

};

// reads alert json from file.
Alerts.prototype.read = function(id) {

	if (localfs.checkExists(getAlertFile(id))) {
		return JSON.parse(localfs.readFile(getAlertFile(id)));
	}
	else {
		logger.showError('Alert file ' + getAlertFile(id) + ' does not exist.');
		process.exit();
	}

};

// get a alert file name
function getAlertFile(id) {
	return alertDir + '/' + id + '.json';
}

module.exports = Alerts;
