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
	'config:grafana:headers',
	'config:grafana:authorization',
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
	this.conf = require('nconf');
}

// Initialize wizzy configuration
Config.prototype.initialize = function() {
	var self = this;
	localfs.createDirIfNotExists(confDir, true);
	var configExists = localfs.checkExists(confFile, 'conf file', false);
	if (configExists) {
		logger.showResult('conf file already exists.');
	} else  {
		self.saveConfig(false);
		logger.showResult('conf file created.');
	}
	logger.showResult('wizzy successfully initialized.');
};

// Check wizzy configuration for status command
Config.prototype.statusCheck = function(showOutput) {
	var check = true;
	check = check && localfs.checkExists(confDir, 'conf directory', showOutput);
	check = check && localfs.checkExists(confFile, 'conf file', showOutput);
	return check;
};

// Check if wizzy config dir, file and config field is initialized
Config.prototype.checkConfigPrereq = function(showOutput) {
	var self = this;
	var check = self.statusCheck(false);
	if (check) {
		if (showOutput) {
			logger.showResult('wizzy configuration is initialized.');
		}
		return;
	} else {
		logger.showError('wizzy configuration not initialized. Please run `wizzy init`.');
		process.exit();
	}
};

// Adds a new wizzy config property
Config.prototype.addProperty = function(key, value, subValue) {
	var self = this;
	self.checkConfigPrereq();
	self.conf.use('file', {file: confFile});
	if (_.includes(configs, key)) {
		if ( key === 'config:grafana:headers' && typeof subValue !== 'undefined' ){
			key += ':' + value;
			value = subValue;
		}
		self.conf.set(key, value);
		self.saveConfig(true);
		logger.showResult(_.join(_.drop(key.split(':'), 1), ' ') + ' updated successfully.');
	} else {
		logger.showError('Unknown configuration property.');
	}
};

// Shows all wizzy configuration properties
Config.prototype.showProperty = function(config) {
	var self = this;
	self.checkConfigPrereq();
	self.conf.use('file', {file: confFile});
	logger.showOutput(logger.stringify(self.conf.get(config)));
};

// Gets a config property from wizzy configuration file
Config.prototype.getProperty = function(config) {
	var self = this;
	self.checkConfigPrereq();
	self.conf.use('file', {file: confFile});
	return(self.conf.get(config));
};

// Save wizzy config file
Config.prototype.saveConfig = function(showOutput) {
	var self = this;
	self.conf.use('file', {file: confFile});
	self.conf.save(function (err) {
		if (err) {
			if (showOutput) {
				logger.showError('Error in saving wizzy conf file.');
			}
		} else {
			if (showOutput) {
				logger.showResult('conf file saved.');
			}
		}
	});
};

module.exports = Config;