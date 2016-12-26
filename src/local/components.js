#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('components');
var Table = require('cli-table');

var _ = require('lodash');

var nconf = require('nconf');

var successMessage;
var failureMessage;

var Datasources = require('../local/datasources.js');
var Orgs = require('../local/orgs.js');
var Dashboards = require('../local/dashboards.js');

var config;

function Components(conf) {
	config = conf;
	this.dashboards = new Dashboards();
	this.orgs = new Orgs();
	this.datasources = new Datasources();
}

Components.prototype.checkDirsStatus = function(showOutput) {

	return this.dashboards.checkDirStatus(showOutput) && 
		this.orgs.checkDirStatus(showOutput) && 
		this.datasources.checkDirStatus(showOutput);

}

// moves or copies a dashboard entity
Components.prototype.moveCopyOrRemove = function(commands) {

	var self = this;

	var command = commands[0];
	var entityType = commands[1];
	var entityValue = commands[2];
	var destination = commands[3];

	var srcDashboardSlug = checkOrGetContextDashboard();
	var srcDashboard = self.dashboards.readDashboard(srcDashboardSlug);
	var sourceArray = entityValue.split('.');
	
	var destinationArray = [];
	if (destination != undefined) {
		destinationArray = destination.split('.');
	}

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
				var destRowNumber = parseInt(destinationArray[0]);
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
				var destDashboard = self.dashboards.readDashboard(destDashboardSlug);
				var destRows = destDashboard.rows;
				var destRowNumber = parseInt(destinationArray[1]);
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
				var destRowNumber = parseInt(destinationArray[0]);
				var destPanels = srcRows[destRowNumber-1].panels;
				var destPanelNumber = parseInt(destinationArray[1]);
				if (command === 'move') {
					srcPanels.splice(srcPanelNumber-1, 1);
				}
				destPanels.splice(destPanelNumber-1, 0, srcPanel);
				self.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
				logger.showResult(successMessage);
			} else if (destinationArray.length === 3) {
				var destDashboardSlug = destinationArray[0];
				var destDashboard = self.dashboards.readDashboard(destDashboardSlug);
				var destRows = destDashboard.rows;
				var destRowNumber = parseInt(destinationArray[1]);
				var destPanels = destRows[destRowNumber-1].panels;
				var destPanelNumber = parseInt(destinationArray[2]);
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
			var destDashboard = self.dashboards.readDashboard(destDashboardSlug);
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
	else {
		logger.showError('Unsupported command called. Use `wizzy help` to find available commands.');
	}
}

// summarizes an entity
Components.prototype.summarize = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];
	var self = this;

	if (entityType === 'dashboard') {
		if (typeof entityValue != 'string') {
			entityValue = config.getConfig('config:context:dashboard');
		}
		successMessage = 'Showed dashboard ' + entityValue + ' summary successfully.';
		self.dashboards.summarize(entityValue);
	} else if (entityType === 'orgs') {
		self.orgs.summarize();
		successMessage = 'Showed orgs summary successfully.';
	} else if (entityType === 'datasources') {
		self.datasources.summarize();
		successMessage = 'Showed datasources summary successfully.';
	} else {
		logger.showError('Unsupported command. Please try `wizzy help`.');
		return;
	}
	logger.showResult(successMessage);

}

Components.prototype.change = function(commands) {

 	var component = commands[0];
 	var entityType = commands[1];
 	var oldDatasource = commands[2];
 	var newDatasource = commands[3];

 	if (commands.length != 4) {
 		logger.showError('Incorrect arguments, please read the usage.')
 		return;
 	}
 	successMessage = 'Datasource changed successfully';
 
 	if (component === 'panels' && entityType === 'datasource') {
 		var entityValue = config.getConfig('config:context:dashboard');
 		if (typeof oldDatasource != 'string') {
 			logger.showError('Old datasource value not supported or incorrect.')
 			return;
 		}
 		if (typeof newDatasource != 'string') {
 			logger.showError('New datasource value not supported or incorrect.')
 			return;
 		}
 		this.dashboards.change(entityValue, oldDatasource, newDatasource);
 		logger.showResult(successMessage);
 	}
 	else {
 		logger.showError('Unsupported entity ' + commands[0] + '. Please try `wizzy help`.');
 	}

 }

// Extracts entities from dashboard json
Components.prototype.extract = function(commands) {

	if (commands[0] === 'temp-var') {
		if (typeof commands[2] != 'string') {
			commands[2] = config.getConfig('config:context:dashboard');
		}
		successMessage = 'Template variable ' + commands[1] + ' extracted successfully.';
		this.dashboards.extract(commands[2], commands[1]);
		logger.showResult(successMessage);
	} else {
		logger.showError('Unsupported entity ' + commands[0] + '. Please try `wizzy help`.');
	}

}

// Inserts entities from local json to dashboard json
Components.prototype.insert = function(commands) {

	if (commands[0] === 'temp-var') {
		if (typeof commands[2] != 'string') {
			commands[2] = config.getConfig('config:context:dashboard');
		}
		successMessage = 'Template variable ' + commands[1] + ' inserted successfully.';
		this.dashboards.insert(commands[2], commands[1]);
		logger.showResult(successMessage);	
	} else {
		logger.showError('Unsupported entity ' + commands[0] + '. Please try `wizzy help`.');
	}

}

// Reads all entities from a directory and removes
Components.prototype.readEntityNamesFromDir = function(dirName) {

	var entities = [];
	entities = _.map(localfs.readFilesFromDir('./' + dirName), function(fileNameWithExtension) {
		return localfs.getFileName(fileNameWithExtension);
	});
	return entities;

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

module.exports = Components;