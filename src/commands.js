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
Commands.prototype.instruct = function(command, entityType, entityValue) {
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
				grafana.summarize(command, entityType, entityValue);
				break;
			default:
				logger.showError('Unsupported command called. Type `wizzy help` for available commands.');
		}
	}
	else {
		return;
	}
}

module.exports = Commands;