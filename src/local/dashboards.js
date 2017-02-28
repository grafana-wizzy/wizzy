#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('dashboards');
var Table = require('cli-table');
var _ = require('lodash');

var dashDir = 'dashboards';

var DashTags = require('../local/dash-tags.js');
var TempVars = require('../local/temp-vars.js');
var Panels = require('../local/panels.js');
var Rows = require('../local/rows.js');

var contextDash;

function Dashboards() {
	this.rows = new Rows();
	this.panels = new Panels();
	this.tempVars = new TempVars();
	this.dashTags = new DashTags();
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
			if (panel.datasource === null) {
				return panel.title + '(default)';
			} else {
				return panel.title + '(' + panel.datasource + ')';
			}
		});

		arch.rows.push({
  		title: row.title,
			panelCount: _.size(row.panels),
			panels: _.join(panelInfo, ', ')
		});
	});
	if ('templating' in dashboard && dashboard.templating.list.length > 0) {
		arch.templateVariableCount = _.size(dashboard.templating.list);
		arch.templateValiableNames = _.join(_.map(dashboard.templating.list, 'name'), ', ');
	}
	if ('tags' in dashboard && dashboard.tags.length > 0) {
		arch.tagCount = _.size(dashboard.tags);
		arch.tags = _.join(dashboard.tags);
	}
	arch.time = dashboard.time;
	arch.time.timezone = dashboard.timezone;
	logger.showOutput(logger.stringify(arch));
};

// Saving a dashboard file on disk
Dashboards.prototype.saveDashboard = function(slug, dashboard, showResult) {
	delete dashboard.id;
	localfs.createDirIfNotExists(dashDir, showResult);
	// we delete version when we import the dashboard... as version is maintained by Grafana
	delete dashboard.version;
	localfs.writeFile(getDashboardFile(slug), logger.stringify(dashboard, null, 2));
	if (showResult) {
		logger.showResult(slug + ' dashboard saved successfully under dashboards directory.');
	}
};

Dashboards.prototype.insert = function(type, entity, destination) {

	var self = this;
	var destArray = destination.split('.');
	var destDashboardSlug = destArray[0];
	var destDashboard = self.readDashboard(destDashboardSlug);

	if (type === 'temp-var') {
		var destTempVarList = destDashboard.templating.list;
		destTempVarList.push(self.tempVars.readTemplateVar(entity));
		self.saveDashboard(destDashboardSlug, destDashboard, true);
		logger.showResult('Template variable ' + entity + ' inserted successfully.');
	} else if (type === 'dash-tags') {
		var dashTagsList = destDashboard.tags;
		destDashboard.tags = destDashboard.tags.concat(self.dashTags.readDashTags(entity));
		self.saveDashboard(destDashboardSlug, destDashboard, true);
		logger.showResult('Dashboard tags ' + entity + 'inserted successfully.');
	} else if (type === 'row') {
		var destRows = destDashboard.rows;
		destRows.push(self.rows.readRow(entity));
		self.saveDashboard(destDashboardSlug, destDashboard, true);
		logger.showResult('Row ' + entity + ' inserted successfully.');
	} else if (type === 'panel') {
		var destRowNumber = parseInt(destArray[1]);
		var destRow = destDashboard.rows[destRowNumber-1];
		destRow.panels.push(self.panels.readPanel(entity));
		self.saveDashboard(destDashboardSlug, destDashboard, true);
		logger.showResult('Panel ' + entity + ' inserted successfully.');
	}

};

Dashboards.prototype.extract = function(type, entity, entityName, dashboard) {

	var srcDashboard = this.readDashboard(dashboard);
	var srcRows;

	if (type === 'temp-var') {
		var srcTempVarList = srcDashboard.templating.list;
		var srcTempVarNumber = parseInt(entity);
		var srcTempVar = srcTempVarList[srcTempVarNumber-1];
		this.tempVars.saveTemplateVar(entityName, srcTempVar, true);
		logger.showResult('Template variable ' + entity + ' extracted successfully.');
	}  else if (type === 'dash-tags') {
		var srcDashTagsList = srcDashboard.tags;
		this.dashTags.saveDashTags(entityName, srcDashTagsList, true);
		logger.showResult('Dashboard Tags extracted successfully.');
	}  else if (type === 'row') {
		srcRows = srcDashboard.rows;
		var srcRowNumber = parseInt(entity);
		var srcRow = srcRows[srcRowNumber-1];
		this.rows.saveRow(entityName, srcRow, true);
		logger.showResult('Row ' + entity + ' extracted successfully.');
	} else if (type === 'panel') {
		var srcEntity = entity.split('.');
		srcRows = srcDashboard.rows;
		var srcPanels = srcRows[srcEntity[0]-1].panels;
		var srcPanelNumber = parseInt(srcEntity[1]);
		var srcPanel = srcPanels[srcPanelNumber-1];
		this.panels.savePanel(entityName, srcPanel, true);
		logger.showResult('Panel ' + entity + ' extracted successfully.');
	}

};

Dashboards.prototype.change = function(entityValue, oldDatasource, newDatasource) {
	var dashboard = this.readDashboard(entityValue);
	_.forEach(dashboard.rows, function(row) {
		_.forEach(row.panels,function(panel){
			if(panel.datasource === oldDatasource){
				panel.datasource = newDatasource;
			}
		});
	});
	this.saveDashboard(entityValue, dashboard, true);
};

Dashboards.prototype.list = function(entityValue, datasource) {
	var dashboard = this.readDashboard(entityValue);
	var panelCount = 0;
	var output = 'Panels:';
	_.forEach(dashboard.rows, function(row) {
		_.forEach(row.panels,function(panel){
			if(panel.datasource === datasource){
				output += '\n ' + panel.title;
				panelCount ++;
			}
		});
	});
	logger.showOutput(output);
	logger.showResult('Total panels with datasource ' + datasource + ': ' + panelCount);
};

// Reads dashboard json from file.
Dashboards.prototype.readDashboard = function(slug) {

	if (localfs.checkExists(getDashboardFile(slug))) {
		return sanitizePanels(JSON.parse(localfs.readFile(getDashboardFile(slug))));
	}
	else {
		logger.showError('Dashboard file ' + getDashboardFile(slug) + ' does not exist.');
		process.exit();
	}

};

function sanitizePanels(dashboard) {

	var panelId = 1;
	_.forEach(dashboard.rows, function(row) {
		_.forEach(row.panels, function(panel) {
			panel.id = panelId;
			panelId++;
		});
	});

	return dashboard;

}

// Get dashboard file name from slug
function getDashboardFile(slug) {
	return dashDir + '/' + slug + '.json';
}

module.exports = Dashboards;
