#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('dashboards');
var Table = require('cli-table');
var _ = require('lodash');

var dashDir = 'dashboards';

var TempVars = require('../local/temp-vars.js');
var Panels = require('../local/panels.js');
var Rows = require('../local/rows.js');

function Dashboards() {
	localfs.createIfNotExists(dashDir, 'dir', false);
	this.tempVars = new TempVars();
	this.panels = new Panels();
	this.rows = new Rows();
}

// checks dir status for the dashboards
Dashboards.prototype.checkDirStatus = function(showOutput) {
	return localfs.checkExists(dashDir, 'dashboards directory', showOutput) && this.tempVars.checkDirStatus(showOutput)
		&& this.panels.checkDirStatus(showOutput) && this.rows.checkDirStatus(showOutput);
}

// summarize dashboard
Dashboards.prototype.summarize = function(dashboardSlug) {
	var dashboard = this.readDashboard(dashboardSlug);
	var arch = {};

	// Extracting row information
	arch.title = dashboard.title;
	arch.rowCount = _.size(dashboard.rows);
	arch.rows = [];
	_.forEach(dashboard.rows, function(row) {

		var panelInfo = _.map(row.panels, function(panel) {
			return panel.title + '(' + panel.datasource + ')';
		});

		arch.rows.push({
  		title: row.title,
			panelCount: _.size(row.panels),
			panels: _.join(panelInfo, ', ')
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

// Saving a dashboard file on disk
Dashboards.prototype.saveDashboard = function(slug, dashboard, showResult) {
	
	// we delete version when we import the dashboard... as version is maintained by Grafana
	delete dashboard.version;
	localfs.writeFile(getDashboardFile(slug), logger.stringify(dashboard, null, 2));
	if (showResult) {
		logger.showResult(slug + ' dashboard saved successfully under dashboards directory.');
	}

}

Dashboards.prototype.insert = function(dashboard, tempVar) {

	var destDashboardSlug = dashboard;
	var destDashboard = this.readDashboard(destDashboardSlug);
	var destTempVarList = destDashboard.templating.list;
	destTempVarList.push(this.tempVars.readTemplateVariable(tempVar));
	this.saveDashboard(destDashboardSlug, destDashboard, true);

}

Dashboards.prototype.extract = function(dashboard, tempVar) {

	var srcDashboard = this.readDashboard(dashboard);
	var srcTempVarList = srcDashboard.templating.list;
	var srcTempVarNumber = parseInt(tempVar);
	var srcTempVar = srcTempVarList[srcTempVarNumber-1];
	this.tempVars.saveTemplateVars(dashboard, srcTempVar, true);

}

Dashboards.prototype.change = function(entityValue, oldDatasource, newDatasource) {

	var dashboard = this.readDashboard(entityValue);
	var arch = {};
	// Extracting row information
	arch.title = dashboard.title;
	arch.rowCount = _.size(dashboard.rows);
	arch.rows = [];
	_.forEach(dashboard.rows, function(row) {
		_.forEach(row.panels,function(panel){
			if(panel.datasource === oldDatasource){
				panel.datasource = newDatasource
			}
		});
	});
	this.saveDashboard(entityValue, dashboard, true);

}

// Reads dashboard json from file.
Dashboards.prototype.readDashboard = function(slug) {

	if (localfs.checkExists(getDashboardFile(slug))) {
		return JSON.parse(localfs.readFile(getDashboardFile(slug)));
	}
	else {
		logger.showError('Dashboard file ' + getDashboardFile(slug) + ' does not exist.');
		process.exit();
	}
	
}

// Get dashboard file name from slug
function getDashboardFile(slug) {
	return dashDir + '/' + slug + '.json';
}

module.exports = Dashboards;