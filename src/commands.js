#!/usr/bin/env node
"use strict";

var _ = require('lodash');
var Config = require('./config.js');
var Components = require('./components.js');
var Grafana = require('./grafana.js');
var Logger = require('./logger.js'); 
var logger = new Logger('Commands');
var LocalFS = require('./localfs.js');
var GNet = require('./gnet.js');
var localfs = new LocalFS();
var help = '\nUsage: wizzy [commands]\n\nCommands:\n';
var config;
var components;
var grafana;
var gnet;

function Commands(dashDir, datasrcDir, orgsDir, tempVarDir, confDir, confFile) {
	config = new Config(confDir, confFile);
	components = new Components(dashDir, datasrcDir, orgsDir, tempVarDir, config);
	gnet = new GNet(components);
	addCommandsToHelp();
}

// Creates an entity in wizzy or Grafana
Commands.prototype.instructions = function() {

		/* Key points before editing the cases:
			1. case 'version' does not have to be defined as it comes from commander.js
			2. process.argv[0] - reserverd for `node`
			3. process.argv[1] - reserverd for `wizzy` or `index.js`
		*/

		var commands = _.drop(process.argv, 2);

		var command = commands[0];

		if (config.checkConfigStatus('config:grafana', false) && components.checkDirsStatus()) {
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
				grafana.import(_.drop(commands));
				break;
			case 'export':
				grafana.export(_.drop(commands));
				break;
			case 'create':
				grafana.create(_.drop(commands));
				break;
			case 'delete':
				grafana.delete(_.drop(commands));
				break;
			case 'show':
				grafana.show(_.drop(commands));
				break;
			case 'list':
				if (commands[1] === 'gnet') {
					gnet.list(_.drop(commands,2));
				} else {
					grafana.list(_.drop(commands));
				}
				break;
			case 'summarize':
				components.summarize(_.drop(commands));
				break;
			case 'change':
        components.change(_.drop(commands));
        break;
			case 'move':
				components.moveCopyOrRemove(commands);
				break;
			case 'copy':
				components.moveCopyOrRemove(commands);
				break;
			case 'remove':
				components.moveCopyOrRemove(commands);
				break;
			case 'extract':
				components.extract(_.drop(commands));
				break;
			case 'insert':
				components.insert(_.drop(commands));
				break;
			case 'download':
				if (commands[1] === 'gnet') {
					gnet.download(_.drop(commands, 2));
				}
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
	addToHelp('wizzy set CONFIG_NAME PROPERTY_NAME PROPERTY_VALUE', 'sets a configuration property for wizzy.');
	addToHelp('wizzy change ENTITY OLD_ENTITY NEW_ENTITY', 'Updates an old entity with a new one on the context dashboard.');
	addToHelp('wizzy copy ENTITY ENTITY_NAME', 'copies an entity from one position to another.');
	addToHelp('wizzy create ENTITY ENTITY_NAME', 'creates a new entity.');
	addToHelp('wizzy delete ENTITY ENTITY_NAME', 'deletes an entity.');
	addToHelp('wizzy download gnet ENTITY ENTITY_NAME', 'download Grafana.net entities.');
	addToHelp('wizzy export ENTITY ENTITY_NAME', 'exports an entity from local repo to Grafana.');
	addToHelp('wizzy extract ENTITY ENTITY_NAME', 'extracts and entity from a local dashboard.');
	addToHelp('wizzy list ENTITIES', 'lists entities in Grafana or Grafana.net.');
	addToHelp('wizzy import ENTITY ENTITY_NAME', 'imports an entity from Grafana to local repo.');
	addToHelp('wizzy insert ENTITY ENTITY_NAME', 'inserts an entity to a local dashboard.');
	addToHelp('wizzy move ENTITY ENTITY_NAME', 'moves an entity from one position to another.');
	addToHelp('wizzy remove ENTITY ENTITY_NAME', 'removes an entity from a local dashboard.');
	addToHelp('wizzy show ENTITY ENTITY_NAME', 'shows an entity.');
	addToHelp('wizzy summarize ENTITY ENTITY_NAME', 'summarize a large entity in a short user-friendly manner.');

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

	var setupProblem = config.checkConfigStatus('config', true);

	if (setupProblem) {
		var setupGit = localfs.checkExists('.git', '.git directory', true);
		if(setupGit)
			logger.showResult('wizzy setup complete.');
		else
			logger.showResult('wizzy setup complete without Git.');
	} else {
		logger.showError('wizzy setup incomplete.');
	}

}

module.exports = Commands;