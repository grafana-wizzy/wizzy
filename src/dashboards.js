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

// returns dashboards directory
Dashboards.prototype.getDashboardsDirectory = function() {
	return dashDir;
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

Dashboards.prototype.move = function(entityType, entityValue, to, destination) {

	if (entityType == 'row' && destination) {
		// move to a new row 
	} else if (entityType == 'row' && destination) {

	}
}

// Summarize a dashboard json
Dashboards.prototype.executeLocalCommand = function(command, entityType, entityValue, destination, sourceDashboard) {

switch(command) {

	case 'move':
	// implement move here
	break;

	case 'copy':
		if (entityType === 'row') {
			successMessage = 'Row successfully copied.';
			failureMessage = 'Error in copying row.';
			dashboard = this.readDashboard(sourceDashboard);
			var rows = dashboard.rows;
			var sourceRow = rows[parseInt(entityValue)-1];
			var destinationArray = destination.split('.');
			if (destinationArray.length === 1) {
				rows.splice(parseInt(destination)-1, 0, sourceRow);
				this.saveDashboard(sourceDashboard, dashboard);
				logger.showResult(successMessage);
			} else if (destinationArray.length === 2) {
				var destinationDashboard = this.readDashboard(destinationArray[0]);
				var destinationRows = destinationDashboard.rows;
				destinationRows.splice(parseInt(destinationArray[1])-1, 0, sourceRow);
				this.saveDashboard(destinationArray[0], destinationDashboard);
				logger.showResult(successMessage);
			} else {
				logger.showError(failureMessage);
			}
		} else if (entityType === 'panel') {
			successMessage = 'Panel successfully copied.';
			failureMessage = 'Error in copying panel.';
			dashboard = this.readDashboard(sourceDashboard);
			var rows = dashboard.rows;
			var sourceRow = rows[parseInt(entityValue)-1];
			var destinationArray = destination.split('.');
			if (destinationArray.length === 1) {
				logger.showError('Unsupported destination.');
			}
			else if (destinationArray.length === 2) {
				var sourceArray = entityValue.split('.');
				var source_panel = rows[parseInt(sourceArray[0])-1].panels[parseInt(sourceArray[1])-1];
				var destination_panels = rows[parseInt(destinationArray[0])-1].panels;
				destination_panels.splice(parseInt(destinationArray[1])-1, 0, source_panel);
				this.saveDashboard(sourceDashboard, dashboard);
				logger.showResult(successMessage);
			} else if (destinationArray.length === 3) {
				var sourceArray = entityValue.split('.');
				var source_panel = rows[parseInt(sourceArray[0])-1].panels[parseInt(sourceArray[1])-1];
				var destinationDashboard = this.readDashboard(destinationArray[0]);
				var destination_panels = destinationDashboard.rows[parseInt(destinationArray[1])-1].panels;
				destination_panels.splice(parseInt(destinationArray[2])-1, 0, source_panel);
				this.saveDashboard(destinationArray[0], destinationDashboard);
				logger.showResult(successMessage);
			}
		}
	break;

	case 'summarize':
		if (entityType === 'dashboard') {
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
		} else {
			logger.showError('Unsupported entity type ' + entityType +'. Please try `wizzy help`.');
		}
	break;

	default:
		logger.showError('Unsupported entity type ' + entityType +'. Please try `wizzy help`.');
	}

}

Dashboards.prototype.saveDashboard = function(slug, dashboard) {
	var dashFile = dashDir + '/' + slug + '.json';
	// we delete version when we import the dashboard... as version is maintained by Grafana
	delete dashboard.version;
	fs.writeFileSync(dashFile, logger.stringify(dashboard, null, 2));
	logger.showResult(slug + ' dashboard saved successfully under dashboards directory.');
}

module.exports = Dashboards;