#!/usr/bin/env node
"use strict";

var Config = require('./config.js');
var Dashboards = require('./dashboards.js');
var Grafana = require('./grafana.js');
var Logger = require('./logger.js'); 
var logger = new Logger('Commands');
var help = '\nUsage: wizzy [commands]\n\nCommands:\n';
var version;
var config;
var dashboards;
var grafana;

function Commands(dashDir, confDir, confFile) {
	config = new Config(confDir, confFile);
	dashboards = new Dashboards(dashDir);
}

Commands.prototype.addCommand = function(program, command, func, syntax, description) {
	
	// Adding command to the cli tool
	if (program != null) {
		program.command(command).action(func);
	}

  // Adding command to help
  help += '\n  ' + syntax;
  if (description != null) {
		help += '\n\t- ' + description;
	}
	help += '\n';

}

// Shows wizzy help
Commands.prototype.help = function() {
	help += '\n';
	logger.justShow(help);
}

// Initialize wizzy
Commands.prototype.init = function() { 

	config.createIfNotExist();
	dashboards.createIfNotExist();
	logger.showResult('wizzy successfully initialized.')

}

// Shows wizzy config
Commands.prototype.showConfig = function() {
	config.showConfig('config');
}

// Shows wizzy status
Commands.prototype.status = function() {

	var setupProblem = dashboards.checkDirStatus('.git', true) && config.checkConfigStatus('config', true);

	if (setupProblem) {
		logger.showResult('wizzy setup complete.');
	} else {
		logger.showError('wizzy setup incomplete.');
	}
}

// Set config properties
Commands.prototype.setConfig = function(type, key, value) {
	config.addProperty('config:'+type+':'+key, value);
}

// Creates an entity in wizzy or Grafana
Commands.prototype.instruct = function(command, entityType, entityValue, destination) {
	
	if (config.checkConfigStatus('config:grafana', false) && dashboards.checkDashboardDirStatus()) {
		grafana = new Grafana(config.getConfig('config:grafana'), dashboards);

		switch(command) {
			case 'import':
				grafana.import(command, entityType, entityValue);
				break;
			case 'export':
				grafana.export(command, entityType, entityValue);
				break;
			case 'create':
				grafana.create(command, entityType, entityValue);
				break;
			case 'delete':
				grafana.delete(command, entityType, entityValue);
				break;
			case 'show':
				grafana.show(command, entityType, entityValue);
				break;
			case 'summarize':
				if (typeof entityValue === 'object') {
					if (checkContextDashboardConfig()) {
						entityValue = config.getConfig('config:context:dashboard');
					} else {
						logger.showError('Either pass dashboard as an argument or set it in context.');
					}
				}
				dashboards.executeLocalCommand(command, entityType, entityValue, destination);
				break;
			case 'move':
				if (checkContextDashboardConfig()) {
					dashboards.executeLocalCommand(command, entityType, entityValue, destination, config.getConfig('config:context:dashboard'));
				}
				break;
			case 'copy':
				if (checkContextDashboardConfig()) {
					dashboards.executeLocalCommand(command, entityType, entityValue, destination, config.getConfig('config:context:dashboard'));
				}
				break;
			default:
				logger.showError('Unsupported remote command called. Type `wizzy help` for available commands.');
		}
	}
	else {
		return;
	}
}

function checkContextDashboardConfig() {
	if (config.checkConfigStatus('config:context:dashboard')) {
		return true;
	} else {
		logger.showError('Please set context dashboard by using `wizzy set context dashboard DASHBOARD_NAME` command.')
		return false;
	}
}

module.exports = Commands;