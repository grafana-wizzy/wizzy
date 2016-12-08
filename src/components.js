#!/usr/bin/env node
"use strict";

var LocalFS = require('./localfs.js');
var localfs = new LocalFS();
var Logger = require('./logger.js');
var logger = new Logger('components');

var _ = require('lodash');

var nconf = require('nconf');

var successMessage;
var failureMessage;

var config;
var dashDir;
var datasrcDir;
var orgsDir;
var tempVarsDir;

function Components(dir, dsDir, orgDir, tempVarDir, conf) {
	datasrcDir = dsDir;
	orgsDir = orgDir;
	tempVarsDir = tempVarDir;
	dashDir = dir;
	config = conf;
}

// creates dashboards dir if not exist
Components.prototype.createIfNotExists = function() {

	localfs.createIfNotExists(dashDir, 'dashboards directory');
	localfs.createIfNotExists(datasrcDir, 'datasources directory');
	localfs.createIfNotExists(orgsDir, 'orgs directory');
	localfs.createIfNotExists(tempVarsDir, 'template-variables directory');

}

Components.prototype.checkDirsStatus = function() {

	return localfs.checkExists(dashDir) && localfs.checkExists(datasrcDir) &&
		localfs.checkExists(orgsDir) && localfs.checkExists(tempVarsDir);

}

// moves or copies a dashboard entity
Components.prototype.moveOrCopy = function(commands) {

	var command = commands[0];
	var entityType = commands[1];
	var entityValue = commands[2];
	var destination = commands[3];

	var srcDashboardSlug = checkOrGetContextDashboard();
	var srcDashboard = this.readDashboard(srcDashboardSlug);
	var sourceArray = entityValue.split('.');
	var destinationArray = destination.split('.');

	if (entityType === 'row' || entityType === 'panel') {

		var srcRows = srcDashboard.rows;
		var srcRowNumber = parseInt(sourceArray[0]);
		var srcRow = srcRows[srcRowNumber-1];

		// row operation
		if (entityType === 'row') {
			successMessage = 'Row successfully copied.';
			failureMessage = 'Error in copying row.';
			// when destination is another row on the same dashboard
			if (destinationArray.length === 1) {
				var destRowNumber = parseInt(destinationArray[0]);
				if (command === 'move') {
					srcRows.splice(srcRowNumber-1, 1);
				}
				srcRows.splice(destRowNumber-1, 0, srcRow);
				this.saveDashboard(srcDashboardSlug, srcDashboard, true);
				logger.showResult(successMessage);
			} 
			// when destination is a row on another dashboard
			else if (destinationArray.length === 2) {
				destDashboardSlug = destinationArray[0];
				var destDashboard = this.readDashboard(destDashboardSlug);
				var destRows = destDashboard.rows;
				var destRowNumber = parseInt(destinationArray[1]);
				if (command === 'move') {
					srcRows.splice(srcRowNumber-1, 1);
					this.saveDashboard(srcDashboardSlug, srcDashboard, true);
				}
				destRows.splice(destRowNumber-1, 0, srcRow);
				this.saveDashboard(destDashboardSlug, destDashboard, true);
				logger.showResult(successMessage);
			} else {
				logger.showError(failureMessage);
			}
		} // panel operation
		else if (entityType === 'panel') {
			successMessage = 'Panel successfully copied.';
			failureMessage = 'Error in copying panel.';
			if (destinationArray.length < 2 || sourceArray.length < 2) {
				logger.showError('Unsupported source or destination.');
				logger.showError(failureMessage);
				return;
			}
			var srcPanels = srcRows[srcRowNumber-1].panels;
			var srcPanelNumber = parseInt(sourceArray[1]);
			var srcPanel = srcPanels[srcPanelNumber-1];

			var destPanels;
			if (destinationArray.length === 2) {
				var destRowNumber = parseInt(destinationArray[0]);
				var destPanels = srcRows[destRowNumber-1].panels;
				var destPanelNumber = parseInt(destinationArray[1]);
				if (command === 'move') {
					srcPanels.splice(srcPanelNumber-1, 1);
				}
				destPanels.splice(destPanelNumber-1, 0, srcPanel);
				this.saveDashboard(srcDashboardSlug, srcDashboard, true);
				logger.showResult(successMessage);
			} else if (destinationArray.length === 3) {
				var destDashboardSlug = destinationArray[0];
				var destDashboard = this.readDashboard(destDashboardSlug);
				var destRows = destDashboard.rows;
				var destRowNumber = parseInt(destinationArray[1]);
				var destPanels = destRows[destRowNumber-1].panels;
				var destPanelNumber = parseInt(destinationArray[2]);
				if (command === 'move') {
					srcPanels.splice(srcPanelNumber-1, 1);
					this.saveDashboard(srcDashboardSlug, srcDashboard, true);
				}
				destPanels.splice(destPanelNumber-1, 0, srcPanel);
				this.saveDashboard(destDashboardSlug, destDashboard, true);
				logger.showResult(successMessage);
			} else {
				logger.showError(failureMessage);
			}
		}
	} // template variable operation
	else if (entityType === 'temp-var') {
		successMessage = 'Template variable successfully copied.';
		failureMessage = 'Error in copying template variable.';
		if (destinationArray.length === 2) {
			var srcTempVarList = srcDashboard.templating.list;
			var srcTempVarNumber = parseInt(sourceArray[0]);
			var srcTempVar = srcTempVarList[srcTempVarNumber-1];
			destDashboardSlug = destinationArray[0];
			var destDashboard = this.readDashboard(destDashboardSlug);
			var destTempVarList = destDashboard.templating.list;
			var destTempVarNumber = parseInt(destinationArray[1]);
			var desrTempVar = srcTempVarList[destTempVarNumber-1];
			if (command === 'move') {
				srcTempVarList.splice(srcTempVarNumber-1, 1);
				this.saveDashboard(srcDashboardSlug, srcDashboard, true);
			}
			destTempVarList.splice(destTempVarNumber-1, 0, srcTempVar);
			this.saveDashboard(destDashboardSlug, destDashboard, true);
			logger.showResult(successMessage);
		} else {
			logger.showError(failureMessage);
			logger.showError('Unknown destination ' + destination + '.');
		}
	}
	else {
		logger.showError('Unsupported command called. Use `wizzy help` to find available commands.');
	}
}

// summarizes a dashboard
Components.prototype.summarize = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

	if (entityType != 'dashboard') {
		printUnsupportedDashboardCommands('entity type ' , entityType);
	} else {
		if (typeof entityValue != 'string') {
			entityValue = config.getConfig('config:context:dashboard');
		}
	}

	successMessage = 'Showed dashboard ' + entityValue + ' summary successfully.';
	failureMessage = 'Error in showing dashboard ' + entityValue + 'summary.';

	var dashboard = this.readDashboard(entityValue);
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
	logger.showResult(successMessage);

}

// Reads dashboard json from file.
Components.prototype.readDashboard = function(slug) {

	if (localfs.checkExists(getDashboardFile(slug))) {
		return JSON.parse(localfs.readFile(getDashboardFile(slug)));
	}
	else {
		logger.showError('Dashboard file ' + getDashboardFile(slug) + ' does not exist.');
		process.exit();
	}
	
}

// Reads org json from file.
Components.prototype.readOrg = function(id) {

	if (localfs.checkExists(getOrgFile(id))) {
		return JSON.parse(localfs.readFile(getOrgFile(id)));
	}
	else {
		logger.showError('Dashboard file ' + getDashboardFile(slug) + ' does not exist.');
		process.exit();
	}

}

// Saving a dashboard file on disk
Components.prototype.saveDashboard = function(slug, dashboard, showResult) {

	// we delete version when we import the dashboard... as version is maintained by Grafana
	delete dashboard.version;
	localfs.writeFile(getDashboardFile(slug), logger.stringify(dashboard, null, 2));
	if (showResult) {
		logger.showResult(slug + ' dashboard saved successfully under dashboards directory.');
	}

}

// Saves an org file under orgs directory on disk
Components.prototype.saveOrg = function(id, org, showResult) {

	localfs.writeFile(getOrgFile(id), logger.stringify(org, null, 2));
	if (showResult) {
		logger.showResult('Org ' + id + ' saved successfully under orgs directory.');
	}

}

// Checking context dashboard setting
function checkOrGetContextDashboard() {

	if (config.checkConfigStatus('config:context:dashboard')) {
		return config.getConfig('config:context:dashboard');
	} else {
		logger.showError('Please set dashboard context using `wizzy set ...` command.');
		process.exit();
	}

}

function getOrgFile(id) {
	return orgsDir + '/' + id +'.json';
}

// Get dashboard file name from slug
function getDashboardFile(slug) {
	return dashDir + '/' + slug + '.json';
}

// Print unsupported message command error
function printUnsupportedDashboardCommands(desc, value) {
	logger.showError('Unsupported ' + desc + ' ' + value +'. Please try `wizzy help`.');
}

module.exports = Components;