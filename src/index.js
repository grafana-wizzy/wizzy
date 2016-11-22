#!/usr/bin/env node
"use strict";

// Setting prettyjson object
var prettyjson = require('prettyjson');

// Setting up defaults
var fs    = require('fs');
var nconf = require('nconf');
var confFile = 'conf/wizzy.json';

var help = '\nUsage: wizzy [commands]\n\ncCommands:';

nconf.argv()
	.env()
 	.file({ file: confFile });

// Setting up commands
var program = require('commander');
program
  .version('1.0.0');

addCommand(program, 'init', init, 'wizzy init GRAFANA_URL',
	'initializes and connects wizzy to Grafana', 'wizzy init http://localhost:3000');

addCommand(program, 'reset', reset, 'wizzy reset GRAFANA_URL',
	'resets Grafana URL in config', 'wizzy reset http://localhost:6000');

addCommand(program, 'help', showHelp, 'wizzy help',
	'shows all available commands');

addCommand(program, 'conf', showConfig, 'wizzy conf',
	'shows wizzy configuration');

addCommand(program, 'create', createEntity, 'wizzy create ENTITY ENTITY_NAME',
	'creates a new entity like a new org or a new dashboard', 'wizzy create dashboard my-dash');

addCommand(program, 'use', useEntity, 'wizzy use ENTITY ENTITY_NAME',
	'points context to an existing entity', 'wizzy use org my-org');

program
	.command('*')
  .action(showHelp);

program
	.parse(process.argv);

if (process.argv.length < 3) {
	showHelp();
}

function init() {
	// Initializing conf dir
	var confDir = 'conf';
	if (!fs.existsSync(confDir)){
    fs.mkdirSync(confDir);
	}

	// Initializing dashboard dir
	var dashDir = 'dashboards';
	if (!fs.existsSync(dashDir)){
    fs.mkdirSync(dashDir);
	}

	if (nconf.get('config:grafana:url')) {
		console.log('wizzy already initialized. use `wizzy update`');
	} else {
		reset();
	}
}

// Prints help for the user
function showHelp() {
	console.log(help);
}

// Prints wizzy config
function showConfig() {
	console.log(prettyjson.render(nconf.get('config')));
}

// Resets Grafana URL
function reset() {
	nconf.set('config:grafana:url', process.argv[3]);
	saveConfig();
	console.log("Configuration updated successfully.")
}

// Save wizzy config
function saveConfig() {
	nconf.save(function (err) {
  	fs.readFile(confFile, function (err, data) {
    	if (err != null) {
    		console.err(err);
    	}
  	});
	});
}

// Adds a command to wizzy cli
function addCommand(program, command, func, syntax, description, example) {
	
	// Adding command to command line tool
	program
		.command(command)
  	.action(func);

  // Adding command to help
  help += '\n  ' + syntax;
  if (description != null) {
		help += '\n\t- ' + description;
	}
	if (example != null) {
		help += '\n\t- Example: ' + example;
	}
}

// Creates an entity
function createEntity() {
	console.log("Creating entity");
}

// Updates context with an existing entity
function useEntity() {
	console.log("Using entity");
}