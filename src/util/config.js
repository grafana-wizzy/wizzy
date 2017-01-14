#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger('Config');

var _ = require('lodash');
var LocalFS = require('./localfs.js');
var localfs = new LocalFS();

var configs = [
	'config:grafana:url',
	'config:grafana:username',
	'config:grafana:password',
	'config:grafana:debug_api',
	'config:context:dashboard',
	'config:s3:access_key',
	'config:s3:secret_key',
	'config:s3:bucket_name',
	'config:s3:path',
	'config:s3:region',
	'config:clip:render_height',
	'config:clip:render_width',
	'config:clip:render_timeout',
	'config:clip:canvas_height',
	'config:clip:canvas_width',
	'config:clip:delay'
];

var confDir = 'conf';
var confFile = 'conf/wizzy.json';

// Constructor
function Config() {
	this.nconf = require('nconf');
	this.nconf.argv().env().file({ file: confFile });
}

// Initialize wizzy configuration
Config.prototype.initialize = function() {
	var self = this;
	localfs.createDirIfNotExists(confDir, true);
	if(!localfs.checkExists(confFile)) {
		self.saveConfig(false);
		logger.showResult('conf file created.');
	} else {
		logger.showResult('conf file already exists.');
	}
}

// Check wizzy configuration for status command
Config.prototype.statusCheck = function() {
	var self = this;
	var check = true;
	check = check && localfs.checkExists(confDir);
	check = check && localfs.checkExists(confFile);
	return check;
};

// Check if wizzy config dir, file and config field is initialized
Config.prototype.checkConfigPrereq = function(showOutput) {
	var self = this;
	var check = self.statusCheck();
	if (check) {
		if (showOutput) {
			logger.showResult('wizzy configuration is initialized.');
		}
		return;
	} else {
		logger.showError('wizzy configuration not initialized. Please run `wizzy init`.');
		process.exit();
	}
}

// Adds a new wizzy config property
Config.prototype.addProperty = function(key, value) {
	var self = this;
	self.checkConfigPrereq();
	if (_.includes(configs, key)) {
		self.nconf.set(key, value);
		self.saveConfig(true);
		logger.showResult(_.join(_.drop(key.split(':'), 1), ' ') + ' updated successfully.');
	} else {
		logger.showError('Unknown configuration property.');
	}
};

// Shows all wizzy configuration properties
Config.prototype.showConfig = function(config) {
	var self = this;
	self.checkConfigPrereq();
	logger.showOutput(logger.stringify(nconf.get(config)));
};

// Gets a config property from wizzy configuration file
Config.prototype.getConfig = function(config) {
	var self = this;
	self.checkConfigPrereq();
	return(self.nconf.get(config));
};

// Save wizzy config file
Config.prototype.saveConfig = function(showResult) {
	var self = this;
	self.nconf.save(function (err) {
		if (err) {
			logger.showError('Error in saving wizzy config.');
		} else {
			localfs.readFile(confFile, false );
	  		if (showResult) {
	  			logger.showResult('wizzy configuration saved.');
	  		}
		}
	});
}

module.exports = Config;