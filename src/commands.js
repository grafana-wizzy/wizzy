#!/usr/bin/env node
"use strict";

var fs = require('fs');
var dashDir = 'dashboards';
var nconf = require('nconf');
var confDir = 'conf';
var confFile = 'conf/wizzy.json'; // Config file location
nconf.argv().env().file({ file: confFile });
var prettyjson = require('prettyjson');
var Logger = require('./logger.js');
var Grafana = require('./grafana.js');
var logger = new Logger();

function Commands(program) {
	this.program = program;
	this.help = '\nUsage: wizzy [commands]\n\nCommands:\n';
}

Commands.prototype.addCommand = function(program, command, func, syntax, description, example) {
	
	// Adding command to the cli tool
	this.program.command(command).action(func);

  // Adding command to help
  this.help += '\n  ' + syntax;
  if (description != null) {
		this.help += '\n\t- ' + description;
	}
	if (example != null) {
		this.help += '\n\t- Example: ' + example;
	}
}

// Shows wizzy help
Commands.prototype.showHelp = function() {
	this.help += '\n';
	console.log(this.help);
}

// Initialize wizzy
Commands.prototype.initWizzy = function() {
	// Initialize the conf dir
	if (!fs.existsSync(confDir)){
    fs.mkdirSync(confDir);
    logger.showResult('conf directory created.')
  } else {
  	logger.showResult('conf directory already exists.')
  }

  // Initialize conf file
  if (!fs.existsSync(confFile)) {
    saveConfig();
    logger.showResult('conf file created.')
	} else {
		logger.showResult('conf file already exists.')
	}

	// Initializing dashboard dir
	if (!fs.existsSync(dashDir)){
    fs.mkdirSync(dashDir);
    logger.showResult('dashboards directory created.')
	} else {
		logger.showResult('dashboards directory already exists.')
	}

	logger.showResult('wizzy successfully initialized.')
}

// Resets Grafana URL
Commands.prototype.setGrafanaConfig = function(configType, configValue) {	

	if (configType === 'url') {
		nconf.set('config:grafana:url', configValue);
	} else if(configType === 'username') {
		nconf.set('config:grafana:username', configValue);
	} else if(configType === 'password') {
		nconf.set('config:grafana:password', configValue);
	}	else {
		logger.showError('Unknown Grafana setting.');
		return;
	}
	saveConfig();
	logger.showResult('Grafana ' + configType + ' updated successfully.');
	//this.grafana = new Grafana(nconf.get('config:grafana'));
}

// Shows wizzy config
Commands.prototype.showConfig = function() {
	console.log(prettyjson.render(nconf.get('config')));
}

// Show wizzy status
Commands.prototype.showStatus = function() {
	var setupProblem = false;
	if (!fs.existsSync('.git')){
		logger.showError('Github not setup in the current directory.');
		setupProblem = true;
	} else {
		logger.showResult('Github repo detected.');
	}
	if (!nconf.get('config:grafana')) {
		logger.showError('Grafana config not initialized.');
		setupProblem = true;
	} else {
		logger.showResult('Grafana configuration found.')
	}
	if (!setupProblem) {
		logger.showResult('wizzy setup complete.');
	} else {
		logger.showError('wizzy setup incomplete.');
	}
}

// Creates an entity
Commands.prototype.createEntity = function(entityType, entityValue) {
	this.grafana.create(entityType, entityValue)
}

// Updates context with an existing entity
Commands.prototype.useEntity = function(entityType, entityValue) {
	this.grafana.use(entityType, entityValue)
}

// Save wizzy config
function saveConfig(){
	nconf.save(function (err) {
  	fs.readFile(confFile, function (err, data) {
    	if (err != null) {
    		logger.showError(err);
    	} else {
    		logger.showResult('wizzy configuration saved.')
    	}
  	});
	});
}

module.exports = Commands;