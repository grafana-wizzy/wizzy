#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('components');
var Table = require('cli-table');

var _ = require('lodash');

var Alerts = require('../local/alerts.js');
var Datasources = require('../local/datasources.js');
var Orgs = require('../local/orgs.js');
var Dashboards = require('../local/dashboards.js');
var Dashlist = require('../local/dashlist.js');

var config;

function Components(conf) {
	config = conf;
	this.alerts = new Alerts();
	this.dashboards = new Dashboards();
	this.orgs = new Orgs();
	this.datasources = new Datasources();
	this.dashlist = new Dashlist();
}

Components.prototype.createIfNotExists = function(showOutput) {
	this.alerts.createIfNotExists(showOutput);
	this.dashboards.createIfNotExists(showOutput);
	this.orgs.createIfNotExists(showOutput);
	this.datasources.createIfNotExists(showOutput);
	this.dashlist.createIfNotExists(showOutput);
};

Components.prototype.checkDirsStatus = function(showOutput) {

	return this.alerts.checkDirStatus(showOutput) &&
		this.dashboards.checkDirStatus(showOutput) &&
		this.orgs.checkDirStatus(showOutput) &&
		this.datasources.checkDirStatus(showOutput) &&
		this.dashlist.checkFileStatus(showOutput);

};

// moves or copies a dashboard entity
Components.prototype.moveCopyOrRemove = function(commands) {

	var self = this;

	var command = commands[0];
	var entityType = commands[1];
	var entityValue = commands[2];
	var destination = commands[3];
	var successMessage;
	var failureMessage;

	var srcDashboardSlug = checkOrGetContextDashboard();
	var srcDashboard = self.dashboards.readDashboard(srcDashboardSlug);
	var sourceArray = entityValue.split('.');

	var destinationArray = [];
	if (destination !== undefined) {
		destinationArray = destination.split('.');
	}
	var destDashboard;
	var destDashboardSlug;

	if (command === 'move') {
		successMessage = 'Successfully moved ' + entityType + '.';
		failureMessage = 'Error in moving ' + entityType + '.';
	} else if (command === 'copy') {
		successMessage = 'Successfully copied ' + entityType + '.';
		failureMessage = 'Error in copying ' + entityType + '.';
	} else if (command === 'remove') {
		successMessage = 'Successfully removed ' + entityType + '.';
		failureMessage = 'Error in removing ' + entityType + '.';
	}

	if (entityType === 'row' || entityType === 'panel') {

		var srcRows = srcDashboard.rows;
		var srcRowNumber = parseInt(sourceArray[0]);
		var srcRow = srcRows[srcRowNumber-1];

		var destRows;
		var destRowNumber;

		// row operation
		if (entityType === 'row') {

			// when only remove row command is triggered
			if (destinationArray.length === 0 && command === 'remove') {
				srcRows.splice(srcRowNumber-1, 1);
				self.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
				logger.showResult(successMessage);
			}

			// when destination is another row on the same dashboard
			else if (destinationArray.length === 1 ) {
				destRowNumber = parseInt(destinationArray[0]);
				if (command === 'move') {
					srcRows.splice(srcRowNumber-1, 1);
				}
				srcRows.splice(destRowNumber-1, 0, srcRow);
				self.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
				logger.showResult(successMessage);
			}

			// when destination is a row on another dashboard
			else if (destinationArray.length === 2) {
				destDashboardSlug = destinationArray[0];
				destDashboard = self.dashboards.readDashboard(destDashboardSlug);
				destRows = destDashboard.rows;
				destRowNumber = parseInt(destinationArray[1]);
				if (command === 'move') {
					srcRows.splice(srcRowNumber-1, 1);
					self.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
				}
				destRows.splice(destRowNumber-1, 0, srcRow);
				self.dashboards.saveDashboard(destDashboardSlug, destDashboard, true);
				logger.showResult(successMessage);
			}

			// something else happened
			else {
				logger.showError(failureMessage);
			}
		}

		// panel operation
		else if (entityType === 'panel') {

			var srcPanels = srcRows[srcRowNumber-1].panels;
			var srcPanelNumber = parseInt(sourceArray[1]);
			var srcPanel = srcPanels[srcPanelNumber-1];

			var destPanels;
			var destPanelNumber;

			// when only remove panel command is triggered
			if (destinationArray.length === 0 && command === 'remove') {
				srcPanels.splice(srcPanelNumber-1, 1);
				self.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
				logger.showResult(successMessage);
			}

			// when destination is just a single number which makes no sense in panels
			else if (destinationArray.length === 1) {
				logger.showError('Unsupported destination ' + destinationArray + '.');
			}

			// when destination is another panel on the same dashboard
			else if (destinationArray.length === 2) {
				destRowNumber = parseInt(destinationArray[0]);
				destPanels = srcRows[destRowNumber-1].panels;
				destPanelNumber = parseInt(destinationArray[1]);
				if (command === 'move') {
					srcPanels.splice(srcPanelNumber-1, 1);
				}
				destPanels.splice(destPanelNumber-1, 0, srcPanel);
				self.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
				logger.showResult(successMessage);
			} else if (destinationArray.length === 3) {
				destDashboardSlug = destinationArray[0];
				destDashboard = self.dashboards.readDashboard(destDashboardSlug);
				destRows = destDashboard.rows;
				destRowNumber = parseInt(destinationArray[1]);
				destPanels = destRows[destRowNumber-1].panels;
				destPanelNumber = parseInt(destinationArray[2]);
				if (command === 'move') {
					srcPanels.splice(srcPanelNumber-1, 1);
					self.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
				}
				destPanels.splice(destPanelNumber-1, 0, srcPanel);
				self.dashboards.saveDashboard(destDashboardSlug, destDashboard, true);
				logger.showResult(successMessage);
			} else {
				logger.showError(failureMessage);
			}
		}
	}

	// template variable operation
	else if (entityType === 'temp-var') {

		var srcTempVarList = srcDashboard.templating.list;
		var srcTempVarNumber = parseInt(sourceArray[0]);
		var srcTempVar = srcTempVarList[srcTempVarNumber-1];

		// remove operation
		if (destinationArray.length === 0 && command === 'remove') {
			srcTempVarList.splice(srcTempVarNumber-1, 1);
			self.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
			logger.showResult(successMessage);
		}

		// invalid destinaton
		else if (destinationArray.length === 1 ) {
			logger.showError(failureMessage);
			logger.showError('Unknown destination ' + destinationArray + '.');
		}

		// valid destination
		else if (destinationArray.length === 2) {

			destDashboardSlug = destinationArray[0];
			destDashboard = self.dashboards.readDashboard(destDashboardSlug);
			var destTempVarList = destDashboard.templating.list;
			var destTempVarNumber = parseInt(destinationArray[1]);
			var desrTempVar = srcTempVarList[destTempVarNumber-1];
			if (command === 'move') {
				srcTempVarList.splice(srcTempVarNumber-1, 1);
				self.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
			}
			destTempVarList.splice(destTempVarNumber-1, 0, srcTempVar);
			self.dashboards.saveDashboard(destDashboardSlug, destDashboard, true);
			logger.showResult(successMessage);
		} else {
			logger.showError(failureMessage);
			logger.showError('Unknown destination ' + destination + '.');
		}
	}

	else if (entityType === 'dash-tags') {
		var srcTagsList = srcDashboard.tags;
		// In this case entityValue is destination
		if (entityValue === undefined && command === 'copy') {
			logger.showError(failureMessage);
			logger.showError('Unknown destination ' + destinationArray + '.');
		} else {
			destDashboard = self.dashboards.readDashboard(entityValue);
			destDashboard.tags = destDashboard.tags.concat(srcTagsList);
			self.dashboards.saveDashboard(entityValue, destDashboard, true);
			logger.showResult(successMessage);
		}
	}
	else {
		logger.showError('Unsupported command called. Use `wizzy help` to find available commands.');
	}
};

// summarizes an entity
Components.prototype.summarize = function(commands) {

	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];
	var successMessage;

	if (entityType === 'dashboard') {
		if (typeof entityValue !== 'string') {
			entityValue = checkOrGetContextDashboard();
		}
		successMessage = 'Showed dashboard ' + entityValue + ' summary successfully.';
		self.dashboards.summarize(entityValue);
	} else if (entityType === 'orgs') {
		self.orgs.summarize();
		successMessage = 'Showed orgs summary successfully.';
	} else if (entityType === 'datasources') {
		self.datasources.summarize();
		successMessage = 'Showed datasources summary successfully.';
	} else if (entityType === 'alerts') {
		self.alerts.summarize();
		successMessage = 'Showed alerts summary successfully.';
	} else {
		logger.showError('Unsupported command. Please try `wizzy help`.');
		return;
	}
	logger.showResult(successMessage);

};

// Change an entity
Components.prototype.change = function(commands) {

	if (commands.length !== 4) {
 		logger.showError('Incorrect arguments, please read the usage.');
 		return;
 	}

 	var component = commands[0];
 	var entityType = commands[1];
	var oldDatasource = commands[2];
 	var newDatasource = commands[3];
 	var successMessage;

 	if (component === 'panels' && entityType === 'datasource') {

 		successMessage = 'Datasource changed successfully';

 		if (typeof oldDatasource !== 'string') {
 			logger.showError('Old datasource value not supported or incorrect.');
 			return;
 		}
 		if (typeof newDatasource !== 'string') {
 			logger.showError('New datasource value not supported or incorrect.');
 			return;
 		}

 		var entityValue = checkOrGetContextDashboard();

 		this.dashboards.change(entityValue, oldDatasource, newDatasource);
 		logger.showResult(successMessage);
 	}
 	else {
 		logger.showError('Unsupported command ' + commands + '. Please try `wizzy help`.');
 	}
};

Components.prototype.list = function(commands) {
	if (commands.length !== 3) {
 		logger.showError('Incorrect arguments, please read the usage.');
 		return;
 	}
 	var component = commands[0];
 	var entityType = commands[1];
	var datasource = commands[2];
 	var successMessage;
 	if (component === 'panels' && entityType === 'datasource') {
 		successMessage = 'Panels with datasource ' + datasource + ' listed successfully';
 		if (typeof datasource !== 'string') {
 			logger.showError('Datasource value not supported or incorrect.');
 			return;
 		}
 		var entityValue = checkOrGetContextDashboard();
 		this.dashboards.list(entityValue, datasource);
 		logger.showResult(successMessage);
 	}
 	else {
 		logger.showError('Unsupported command ' + commands + '. Please try `wizzy help`.');
 	}
 };

// Extracts entities from dashboard json to local independent json
Components.prototype.extract = function(commands) {

	// Getting the context dashboard
	var dashboard = checkOrGetContextDashboard();
	if (commands[0] === 'temp-var' || commands[0] === 'panel' || commands[0] === 'row') {
		// Validating rows,panels and temp-vars commands
		if (typeof commands[2] !== 'string') {
			logger.showError('Please provide a name for ' + commands[0] + ' ' + commands[1] + '.');
			return;
		}
		this.dashboards.extract(commands[0], commands[1], commands[2], dashboard);
	} else if (commands[0] === 'dash-tags') {
		// Validating dash-tags commands
		if (typeof commands[1] !== 'string') {
			logger.showError('Please provide a name for ' + commands[0] + '.');
			return;
		}
		this.dashboards.extract(commands[0], null, commands[1], dashboard);
	} else {
		logger.showError('Unsupported entity ' + commands[0] + '. Please try `wizzy help`.');
	}

};

// Inserts entities from local independent json to dashboard json
Components.prototype.insert = function(commands) {

	var dashboard;
	if (commands[0] === 'temp-var' || commands[0] === 'row') {
		// Getting the context dashboard
		if (typeof commands[2] === 'string') {
			dashboard = commands[2];
		} else {
			dashboard = checkOrGetContextDashboard();
		}
		this.dashboards.insert(commands[0], commands[1], dashboard);
	} else if (commands[0] === 'panel') {
		var destinationArray;
		if (typeof commands[2] === 'string') {
			destinationArray = commands[2].split('.');
			if (destinationArray.length === 1) {
				dashboard = checkOrGetContextDashboard() + '.' + commands[2];
			} else {
				dashboard = commands[2];
			}
			this.dashboards.insert(commands[0], commands[1], dashboard);
		} else {
			logger.showError('Unknown destination for panel.');
		}
	} else if (commands[0] === 'dash-tags') {
		// Getting the context dashboard
		if (typeof commands[2] === 'string') {
			dashboard = commands[2];
		} else {
			dashboard = checkOrGetContextDashboard();
		}
		this.dashboards.insert(commands[0], commands[1], dashboard);
	} else {
		logger.showError('Unsupported entity ' + commands[0] + '. Please try `wizzy help`.');
	}

};

// Reads all entities from a directory and removes
Components.prototype.readEntityNamesFromDir = function(dirName) {

	var entities = [];
	entities = _.map(localfs.readFilesFromDir('./' + dirName), function(fileNameWithExtension) {
		return localfs.getFileName(fileNameWithExtension);
	});
	return entities;

};

// Checking context dashboard setting
function checkOrGetContextDashboard() {

	if (config.context && config.context.dashboard) {
		return config.context.dashboard;
	} else {
		logger.showError('Please set dashboard context using `wizzy set ...` command.');
		process.exit();
	}

}

module.exports = Components;
