#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger('Config');

var _ = require('lodash');
var fs = require('fs');
var nconf = require('nconf');

var configs = [
	'config:grafana:url',
	'config:grafana:username',
	'config:grafana:password',
	'config:grafana:debug_api',
	'config:context:dashboard'
]

var confDir;
var confFile;

function Config(dir, file) {
	confDir = dir;
	confFile = file;
	nconf.argv().env().file({ file: confFile });
}

Config.prototype.createIfNotExists = function() {

	// Initialize the conf dir
	if (!checkIfFileExists(confDir)){
    fs.mkdirSync(confDir);
    logger.showResult('conf directory created.')
  } else {
  	logger.showResult('conf directory already exists.')
  }

  // Initialize conf file
  if (!checkIfFileExists(confFile)) {
    saveConfig();
    logger.showResult('conf file created.')
	} else {
		logger.showResult('conf file already exists.')
	}

}

Config.prototype.checkConfigStatus = function(prop, showWhenOk) {

	checkConfigPrerequisites();
	if (!nconf.get(prop)) {
		logger.showError('Config not found.');
		return false;
	} else {
		if(showWhenOk) {
			logger.showResult('Configuration found.')
		}
		return true;
	}

}

// Adds a new wizzy config property
Config.prototype.addProperty = function(key, value) {

	checkConfigPrerequisites();
	if (_.includes(configs, key)) {
		nconf.set(key, value);
		saveConfig();
		logger.showResult(_.join(_.drop(key.split(':'), 1), ' ') + ' updated successfully.');
	} else {
		logger.showError('Unknown configuration property.');
	}

}

// Shows wizzy config
Config.prototype.showConfig = function(config) {
	
	checkConfigPrerequisites();
	logger.showOutput(logger.stringify(nconf.get(config)));

}

// Shows wizzy config
Config.prototype.getConfig = function(config) {
	
	checkConfigPrerequisites();
	return(nconf.get(config));

}

// check if conf dir and conf file exists or not.
function checkConfigPrerequisites() {

	if (checkIfFileExists(confDir) && checkIfFileExists(confFile)) {
		return;
	} else {
		logger.showError('wizzy configuration not initialized. Please run `wizzy init`.');
		process.exit();
	}

}

// check if a directory or a file exists or not
function checkIfFileExists(file) {

	if (fs.existsSync(file)) {
		return true;
	}
	else {
		return false;
	}

}

// Save wizzy config
function saveConfig() {

	checkConfigPrerequisites();
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

module.exports = Config;