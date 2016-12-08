#!/usr/bin/env node
"use strict";

var _ = require('lodash');
var Config = require('./config.js');
var Dashboards = require('./dashboards.js');
var Grafana = require('./grafana.js');
var Logger = require('./logger.js'); 
var logger = new Logger('Commands');
var help = '\nUsage: wizzy [commands]\n\nCommands:\n';
var config;
var components;
var grafana;

function Commands(dashDir, datasrcDir, orgsDir, tempVarDir, confDir, confFile) {
	config = new Config(confDir, confFile);
	components = new Components(dashDir, datasrcDir, orgsDir, tempVarDir, config);
	addCommandsToHelp();
}

// Creates an entity in wizzy or Grafana
Commands.prototype.instructions = function() {

		/* Key points before editing the cases:
			1. case 'version' does not have to be defined as it comes from commander.js
			2. process.argv[0] - reserverd for `node`
			3. process.argv[1] - reserverd for `wizzy` or `index.js`
		*/

		commamds = _.drop(process.argv, 2);

		var command = commands[0];

		if (config.checkConfigStatus('config:grafana', false) && components.checkDashboardDirStatus()) {
			grafana = new Grafana(config.getConfig('config:grafana'), components);
		}

		switch(command) {
			
			case 'help':
				showHelp();
				break;
			case 'init':
				config.createIfNotExists();
				components.createIfNotExists();
				logger.showResult('wizzy successfully initialized.')
				break;
			case 'status':
				status();
				break;
			case 'conf':
					config.showConfig('config');
				break;
			case 'set':
					/*
						// TODO: Give an example how a property is added.
					*/
					config.addProperty('config:' + commands[1] + ':' + commands[2], commands[3]);
				break;
			case 'import':
				grafana.import(commands);
				break;
			case 'export':
				grafana.export(commands);
				break;
			case 'create':
				grafana.create(commands);
				break;
			case 'delete':
				grafana.delete(commands);
				break;
			case 'show':
				grafana.show(commands);
				break;
			case 'list':
				grafana.list(commands);
				break;
			case 'summarize':
				components.summarize(commands);
				break;
			case 'move':
				components.moveOrCopy(commands);
				break;
			case 'copy':
				components.moveOrCopy(commands);
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
	addToHelp('wizzy list ENTITIES', 'lists entities in Grafana');
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

	var setupProblem = components.checkDirStatus('.git', true) && config.checkConfigStatus('config', true);

	if (setupProblem) {
		logger.showResult('wizzy setup complete.');
	} else {
		logger.showError('wizzy setup incomplete.');
	}
}

module.exports = Commands;