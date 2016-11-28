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
	dashboards = new Dashboards(dashDir, config);
	if (config.checkConfigStatus('config:grafana', false) && dashboards.checkDashboardDirStatus()) {
		grafana = new Grafana(config.getConfig('config:grafana'), dashboards);
	}
	addCommandsToHelp();
}

// Creates an entity in wizzy or Grafana
Commands.prototype.instructions = function(command) {

		/* Key points before editing the cases:
			1. case 'version' does not have to be defined as it comes from commander.js
			2. process.argv[0] - reserverd for `node`
			3. process.argv[1] - reserverd for `wizzy` or `index.js`
			4. process.argv[2] - reserverd for variable `command`.
		*/

		switch(command) {
			
			case 'help':
				showHelp();
				break;
			case 'init':
				config.createIfNotExists();
				dashboards.createIfNotExists();
				logger.showResult('wizzy successfully initialized.')
				break;
			case 'status':
				status();
				break;
			case 'conf':
					config.showConfig('config');
				break;
			case 'set':
					config.addProperty('config:'+process.argv[3]+':'+process.argv[4], process.argv[5]);
				break;
			case 'import':
				grafana.import(command, process.argv[3], process.argv[4]);
				break;
			case 'export':
				grafana.export(command, process.argv[3], process.argv[4]);
				break;
			case 'create':
				grafana.create(command, process.argv[3], process.argv[4]);
				break;
			case 'delete':
				grafana.delete(command, process.argv[3], process.argv[4]);
				break;
			case 'show':
				grafana.show(command, process.argv[3], process.argv[4]);
				break;
			case 'summarize':
				dashboards.summarize(process.argv[3], process.argv[4]);
				break;
			case 'move':
				dashboards.moveOrCopy(command, process.argv[3], process.argv[4], process.argv[5]);
				break;
			case 'copy':
				dashboards.moveOrCopy(command, process.argv[3], process.argv[4], process.argv[5]);
				break;
			default:
				logger.showError('Unsupported command called.');
				logger.justShow(help);
		}
}

function addCommandsToHelp() {

	addToHelp('wizzy help', 'shows available wizzy commands');
	addToHelp('wizzy init', 'creates conf file with conf and dashboards directories.');
	addToHelp('wizzy status', 'checks if any configuration property and if .git directory exists.');
	addToHelp('wizzy conf', 'shows wizzy configuration properties.');
	addToHelp('wizzy set CONFIG_NAME PROPERTY_NAME PROPERTY_VALUE', 'sets a configuration property for wizzy');
	addToHelp('wizzy copy ENTITY ENTITY_NAME', 'copies an entity from one position to another');
	addToHelp('wizzy create ENTITY ENTITY_NAME', 'creates a new entity', 'wizzy create org my-org');
	addToHelp('wizzy delete ENTITY ENTITY_NAME', 'deletes an entity', 'wizzy delete org org_id');
	addToHelp('wizzy export ENTITY ENTITY_NAME', 'exports an entity from local repo to Grafana');
	addToHelp('wizzy import ENTITY ENTITY_NAME', 'imports an entity from Grafana to local repo');
	addToHelp('wizzy move ENTITY ENTITY_NAME', 'moves an entity from one position to another');
	addToHelp('wizzy show ENTITY ENTITY_NAME', 'shows an entity', 'wizzy show org 1, wizzy show orgs');
	addToHelp('wizzy summarize ENTITY ENTITY_NAME', 'summarize a large entity in a short user-friendly manner');

}

function addToHelp(syntax, description) {

	// Adding command to help
  help += '\n  ' + syntax;
  if (description != null) {
		help += ' - ' + description;
	}

}

// Shows wizzy help
function showHelp() {
	help += '\n';
	logger.justShow(help);
}

// Shows wizzy status
function status() {

	var setupProblem = dashboards.checkDirStatus('.git', true) && config.checkConfigStatus('config', true);

	if (setupProblem) {
		logger.showResult('wizzy setup complete.');
	} else {
		logger.showError('wizzy setup incomplete.');
	}
}

module.exports = Commands;