#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();

var _ = require('lodash');
var fs = require('fs');
var nconf = require('nconf');

var successMessage;
var failureMessage;

var config;
var dashDir;

function Dashboards(dir, conf) {
	dashDir = dir;
	config = conf;
}

// creates dashboards dir if not exist
Dashboards.prototype.createIfNotExists = function() {

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

// returns dashboards directory
Dashboards.prototype.getDashboardsDirectory = function() {
	return dashDir;
}

// moves or copies a dashboard entity
Dashboards.prototype.moveOrCopy = function(command, entityType, entityValue, destination) {

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
Dashboards.prototype.summarize = function(entityType, entityValue) {

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
Dashboards.prototype.readDashboard = function(slug) {
	checkIfDashboardExists(slug);
	var dashboard = JSON.parse(fs.readFileSync(getDashboardFile(slug), 'utf8', function (error, data) {
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

// Saving a dashboard file on disk
Dashboards.prototype.saveDashboard = function(slug, dashboard, showResult) {
	//checkIfDashboardExists(slug);
	// we delete version when we import the dashboard... as version is maintained by Grafana
	delete dashboard.version;
	fs.writeFileSync(getDashboardFile(slug), logger.stringify(dashboard, null, 2));
	if (showResult) {
		logger.showResult(slug + ' dashboard saved successfully under dashboards directory.');
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

// Check if a dashboard exists or not on local disk
function checkIfDashboardExists(slug) {

	if (fs.existsSync(getDashboardFile(slug))) {
		return true;
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

// Print unsupported message command error
function printUnsupportedDashboardCommands(desc, value) {
	logger.showError('Unsupported ' + desc + ' ' + value +'. Please try `wizzy help`.');
}

module.exports = Dashboards;