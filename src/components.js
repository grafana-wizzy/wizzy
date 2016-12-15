#!/usr/bin/env node
"use strict";

var LocalFS = require('./localfs.js');
var localfs = new LocalFS();
var Logger = require('./logger.js');
var logger = new Logger('components');
var Table = require('cli-table');

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

	localfs.createIfNotExists(dashDir, 'dir', 'dashboards directory');
	localfs.createIfNotExists(datasrcDir, 'dir', 'datasources directory');
	localfs.createIfNotExists(orgsDir, 'dir', 'orgs directory');
	localfs.createIfNotExists(tempVarsDir, 'dir', 'template-variables directory');

}

Components.prototype.checkDirsStatus = function() {

	return localfs.checkExists(dashDir) && localfs.checkExists(datasrcDir) &&
		localfs.checkExists(orgsDir) && localfs.checkExists(tempVarsDir);

}

// moves or copies a dashboard entity
Components.prototype.moveOrCopy = function(commands) {

	var self = this;

	var command = commands[0];
	var entityType = commands[1];
	var entityValue = commands[2];
	var destination = commands[3];

	var srcDashboardSlug = checkOrGetContextDashboard();
	var srcDashboard = self.readDashboard(srcDashboardSlug);
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
				self.saveDashboard(srcDashboardSlug, srcDashboard, true);
				logger.showResult(successMessage);
			} 
			// when destination is a row on another dashboard
			else if (destinationArray.length === 2) {
				destDashboardSlug = destinationArray[0];
				var destDashboard = self.readDashboard(destDashboardSlug);
				var destRows = destDashboard.rows;
				var destRowNumber = parseInt(destinationArray[1]);
				if (command === 'move') {
					srcRows.splice(srcRowNumber-1, 1);
					self.saveDashboard(srcDashboardSlug, srcDashboard, true);
				}
				destRows.splice(destRowNumber-1, 0, srcRow);
				self.saveDashboard(destDashboardSlug, destDashboard, true);
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
				self.saveDashboard(srcDashboardSlug, srcDashboard, true);
				logger.showResult(successMessage);
			} else if (destinationArray.length === 3) {
				var destDashboardSlug = destinationArray[0];
				var destDashboard = self.readDashboard(destDashboardSlug);
				var destRows = destDashboard.rows;
				var destRowNumber = parseInt(destinationArray[1]);
				var destPanels = destRows[destRowNumber-1].panels;
				var destPanelNumber = parseInt(destinationArray[2]);
				if (command === 'move') {
					srcPanels.splice(srcPanelNumber-1, 1);
					self.saveDashboard(srcDashboardSlug, srcDashboard, true);
				}
				destPanels.splice(destPanelNumber-1, 0, srcPanel);
				self.saveDashboard(destDashboardSlug, destDashboard, true);
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
			var destDashboard = self.readDashboard(destDashboardSlug);
			var destTempVarList = destDashboard.templating.list;
			var destTempVarNumber = parseInt(destinationArray[1]);
			var desrTempVar = srcTempVarList[destTempVarNumber-1];
			if (command === 'move') {
				srcTempVarList.splice(srcTempVarNumber-1, 1);
				self.saveDashboard(srcDashboardSlug, srcDashboard, true);
			}
			destTempVarList.splice(destTempVarNumber-1, 0, srcTempVar);
			self.saveDashboard(destDashboardSlug, destDashboard, true);
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

	var self = this;

	if (entityType === 'dashboard') {
		if (typeof entityValue != 'string') {
			entityValue = config.getConfig('config:context:dashboard');
		}

		successMessage = 'Showed dashboard ' + entityValue + ' summary successfully.';

		var dashboard = self.readDashboard(entityValue);
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
	} else if (entityType === 'orgs') {

		successMessage = 'Showed orgs summary successfully.';

		var table = new Table({
    	head: ['Org Id', 'Org Name'],
  		colWidths: [25, 25]
		});

		var orgFiles = localfs.readFilesFromDir(orgsDir);
		_.each(orgFiles, function(orgFile) {
			var org = self.readOrg(getFileName(orgFile));
			table.push([org.id, org.name]);
		});

  	logger.showOutput(table.toString());
  	logger.showResult('Total orgs: ' + orgFiles.length);

	} else if (entityType === 'datasources') {

		successMessage = 'Showed datasources summary successfully.';

		var table = new Table({
    	head: ['Datasource Id', 'Datasource Name', 'Datasource Type'],
  		colWidths: [30, 30, 30]
		});

		var dsFiles = localfs.readFilesFromDir(datasrcDir);
		_.each(dsFiles, function(dsFile) {
			var ds = self.readDatasource(getFileName(dsFile));
			table.push([ds.id, ds.name, ds.type]);
		});

  	logger.showOutput(table.toString());
  	logger.showResult('Total datasources: ' + dsFiles.length);

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

	var self = this;
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
 		var dashboard = self.readDashboard(entityValue);
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
 		logger.showResult(successMessage);
 		this.saveDashboard(entityValue, dashboard, true);
 	}
 	else {
 		logger.showError('Unsupported entity ' + commands[0] + '. Please try `wizzy help`.');
 	}

 }

 
// Extracts entities from dashboard json
Components.prototype.extract = function(commands) {

	if (commands[0] === 'temp-var') {

		successMessage = 'Template variable ' + commands[1] + ' extracted successfully.';

		var srcDashboardSlug = checkOrGetContextDashboard();
		var srcDashboard = this.readDashboard(srcDashboardSlug);
		var srcTempVarList = srcDashboard.templating.list;
		var srcTempVarNumber = parseInt(commands[1]);
		var srcTempVar = srcTempVarList[srcTempVarNumber-1];
		
		this.saveTemplateVars(commands[2], srcTempVar, true);

	} else {
		logger.showError('Unsupported entity ' + commands[0] + '. Please try `wizzy help`.');
		return;
	}

	logger.showResult(successMessage);

}

// Inserts entities from local json to dashboard json
Components.prototype.insert = function(commands) {

	if (commands[0] === 'temp-var') {

		if (typeof commands[2] != 'string') {
			commands[2] = config.getConfig('config:context:dashboard');
		}

		successMessage = 'Template variable ' + commands[1] + ' inserted successfully.';

		var destDashboardSlug = commands[2]
		var destDashboard = this.readDashboard(destDashboardSlug);
		var destTempVarList = destDashboard.templating.list;
		destTempVarList.push(this.readTemplateVariable(commands[1]));
		this.saveDashboard(destDashboardSlug, destDashboard, true);

	} else {
		logger.showError('Unsupported entity ' + commands[0] + '. Please try `wizzy help`.');
		return;
	}

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
		logger.showError('Org file ' + getOrgFile(id) + ' does not exist.');
		process.exit();
	}

}

// Reads datasource json from file.
Components.prototype.readDatasource = function(id) {

	if (localfs.checkExists(getDatasourceFile(id))) {
		return JSON.parse(localfs.readFile(getDatasourceFile(id)));
	}
	else {
		logger.showError('Datasource file ' + getDatasourceFile(id) + ' does not exist.');
		process.exit();
	}

}

// Reads template variable json from file.
Components.prototype.readTemplateVariable = function(varName) {

	if (localfs.checkExists(getTempVarFile(varName))) {
		return JSON.parse(localfs.readFile(getTempVarFile(varName)));
	}
	else {
		logger.showError('Template variable file ' + getTempVarFile(varName) + ' does not exist.');
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

// Saves a datasource file under datasources directory on disk
Components.prototype.saveDatasource = function(id, datasource, showResult) {

	localfs.writeFile(getDatasourceFile(id), logger.stringify(datasource, null, 2));
	if (showResult) {
		logger.showResult('Datasource ' + id + ' saved successfully under datasources directory.');
	}

}

// Save a template variable under template-variables directory on disk
Components.prototype.saveTemplateVars = function(varName, content, showResult) {

	localfs.writeFile(getTempVarFile(varName), logger.stringify(content, null, 2));
	if (showResult) {
		logger.showResult('Template variable ' + varName + ' saved successfully under template-vars directory.');
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

function getDatasourceFile(id) {
	return datasrcDir + '/' + id + '.json';
}

function getOrgFile(id) {
	return orgsDir + '/' + id +'.json';
}

// Get dashboard file name from slug
function getDashboardFile(slug) {
	return dashDir + '/' + slug + '.json';
}

// Get temp-var file name from var name
function getTempVarFile(varName) {
	return tempVarsDir + '/' + varName + '.json';
}

function getFileName(fileNameWithExtension) {
	return fileNameWithExtension.split('.')[0];
}

module.exports = Components;