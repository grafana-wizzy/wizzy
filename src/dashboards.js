#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();

var _ = require('lodash');
var fs = require('fs');
var nconf = require('nconf');

var dashDir;
function Dashboards(dir) {
	dashDir = dir;
}

// creates dashboards dir if not exist
Dashboards.prototype.createIfNotExist = function() {

	// Initializing dashboard dir
	if (!fs.existsSync(dashDir)){
    fs.mkdirSync(dashDir);
    logger.showResult('dashboards directory created.')
	} else {
		logger.showResult('dashboards directory already exists.')
	}

}

// checks any dir existence and shows the OK message when needed
Dashboards.prototype.checkDirStatus = function(dir, showWhenOk) {

	if (!fs.existsSync(dir)){
		logger.showError(dir + ' directory does not exist.');
		return false;
	} else {
		if(showWhenOk) {
			logger.showResult(dir + ' directory detected.');
		}
		return true;
	}

}

// checks dashboards dir status
Dashboards.prototype.checkDashboardDirStatus = function() {
	return this.checkDirStatus(dashDir, false);
}

// Reads dashboard json from file.
Dashboards.prototype.readDashboard = function(slug) {
	var dashFile = dashDir + '/' + slug + '.json';
	var dashboard = JSON.parse(fs.readFileSync(dashFile, 'utf8', function (error, data) {
		if (!error) {
			logger.showResult('Verified file ' + slug + ' as a valid JSON.');
		}
		else {
			logger.showError(slug + '.json file is not a valid JSON.');
			process.exit();
		}
	}));
	return dashboard;
}

// Summarize a dashboard json
Dashboards.prototype.summarizeDashboard = function(slug) {

	var dashboard = this.readDashboard(slug);

	var arch = {};

	// Extracting row information
	arch.title = dashboard.title;
	arch.rowCount = _.size(dashboard.rows);
	arch.rows = [];
	_.forEach(dashboard.rows, function(row) {
		arch.rows.push({
  		title: row.title,
			panelCount: _.size(row.panels),
			panelTitles: _.join(_.map(row.panels,'title'), ', ')
		});
	});
	if ('templating' in dashboard) {
		arch.templateVariableCount = _.size(dashboard.templating.list);
		arch.templateValiableNames = _.join(_.map(dashboard.templating.list, 'name'), ', ');
	}
	arch.time = dashboard.time;
	arch.time.timezone = dashboard.timezone;
	logger.showOutput(logger.stringify(arch));
}

Dashboards.prototype.saveDashboard = function(slug, dashboard) {
	var dashFile = dashDir + '/' + slug + '.json';
	fs.writeFileSync(dashFile, logger.stringify(dashboard, null, 2));
	logger.showResult(slug + ' dashboard saved successfully under dashboards directory.');
}

module.exports = Dashboards;