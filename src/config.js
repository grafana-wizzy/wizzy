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

Config.prototype.createIfNotExist = function() {

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

}

Config.prototype.checkConfigStatus = function(prop, showWhenOk) {

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

	if (_.includes(configs, key)) {
		nconf.set(key, value);
		saveConfig();
		logger.showResult(_.join(_.drop(key.split(':'), 1), ' ') + ' updated successfully.');
	} else {
		logger.showError('Unknown configuration property.');
		//displaySupportedProperties();
	}

}

// Shows wizzy config
Config.prototype.showConfig = function(config) {
	
	logger.showOutput(logger.stringify(nconf.get(config)));

}

/*
function displaySupportedProperties() {
	
	var output = 'Supported commands:';
	_.forEach(configs, function(config){
		output += '\n wizzy set ' + _.join(_.drop(config.split(':'), 1), ' ');
	});
	logger.showOutput(output);

}*/

Config.prototype.getConfig = function(config) {

	return nconf.get(config);

}

// Save wizzy config
function saveConfig() {
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