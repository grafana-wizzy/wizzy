#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger('Config');

var _ = require('lodash');
var LocalFS = require('./localfs.js');
var localfs = new LocalFS();
var nconf = require('nconf');

var configs = [
	'config:grafana:url',
	'config:grafana:username',
	'config:grafana:password',
	'config:grafana:debug_api',
	'config:context:dashboard',
	'config:clip:render_height',
	'config:clip:render_width',
	'config:clip:render_timeout',
	'config:clip:canvas_height',
	'config:clip:canvas_width',
	'config:clip:delay'
]

var confDir;
var confFile;

function Config(dir, file) {
	confDir = dir;
	confFile = file;
	nconf.argv().env().file({ file: confFile });
}

Config.prototype.createIfNotExists = function() {

	localfs.createIfNotExists(confDir, 'dir', 'conf directory');
	if(!localfs.checkExists(confFile)) {
		saveConfig(false);
		logger.showResult('conf file created.')
	} else {
		logger.showResult('conf file already exists.')
	}

}

Config.prototype.checkConfigStatus = function(prop, showOutput) {

	if (!nconf.get(prop)) {
		if (showOutput) {
			logger.showError('Config not found.');
		}
		return false;
	} else {
		if(showOutput) {
			logger.showResult('Configuration found.')
		}
		return true;
	}

}

// Adds a new wizzy config property
Config.prototype.addProperty = function(key, value) {

	if (_.includes(configs, key)) {
		nconf.set(key, value);
		saveConfig(true);
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

	if (localfs.checkExists(confDir) && localfs.checkExists(confFile)) {
		return;
	} else {
		logger.showError('wizzy configuration not initialized. Please run `wizzy init`.');
		process.exit();
	}

}

// Save wizzy config
function saveConfig(showResult) {

	nconf.save(function (err) {
  	localfs.readFile(confFile, false );
  	if (showResult) {
  		logger.showResult('wizzy configuration saved.');
  	}
	});
}

module.exports = Config;