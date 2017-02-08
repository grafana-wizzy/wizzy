#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger('Config');

var _ = require('lodash');
var LocalFS = require('./localfs.js');
var localfs = new LocalFS();

var confDir = 'conf';
var confFile = 'conf/wizzy.json';

var validConfigs = [
	'grafana:url',
	'grafana:username',
	'grafana:password',
	'grafana:debug_api',
	'grafana:headers',
	'grafana:api_key',
	'grafana:envs',
	'context:dashboard',
	'context:grafana',
	's3:bucket_name',
	's3:path',
	'clip:render_height',
	'clip:render_width',
	'clip:render_timeout',
	'clip:canvas_width',
	'clip:canvas_height',
	'clip:delay'
];

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
		self.conf.set('config', {});
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
Config.prototype.addProperty = function(commands) {
	var self = this;
	self.checkConfigPrereq();
	self.conf.use('file', {file: confFile});
	var config = commands[0] + ':' + commands[1];
	if (_.includes(validConfigs, config)) {
		var values = commands.splice(2);
		var value;
		if (values.length === 0) {
			logger.showError('Missing configuration property value.');
			return;
		} else if (values.length === 1) {
			value = values[0];
		} else if (values.length === 2) {
			config = config + ':' + values[0];
			value = values[1];
		} else if (values.length === 3) {
			config = config + ':' + values[0] + ':' + values[1];
			value = values[2];
		} else if (values.length === 4) {
			config = config + ':' + values[0] + ':' + values[1] + ':' + values[2];
			value = values[3];
		} else {
			logger.showError('Unknown configuration property or missing property value.');
			return;
		}		
		self.conf.set('config:' + config, value);
		self.saveConfig(true);
		logger.showResult(config + ' updated successfully.');
	} else {
		logger.showError('Unknown configuration property or missing property value.');
	}
};

// Removes an existing wizzy config property
Config.prototype.removeProperty = function(commands) {
	var self = this;
	self.checkConfigPrereq();
	self.conf.use('file', {file: confFile});
	var config = commands[0] + ':' + commands[1];
	if (_.includes(validConfigs, config)) {
		var parent;
		var property;
		if (commands.length < 2) {
			logger.showError('Missing configuration property value.');
			return;
		} else if (commands.length === 2) {
			parent = commands[0];
			property = commands[1];
		} else if (commands.length === 3) {
			parent = commands[0] + ':' + commands[1];
			property = commands[2];
		} else if (commands.length === 4) {
			parent = commands[0] + ':' + commands[1] + ':' + commands[2];
			property = commands[3];
		} else {
			logger.showError('Unknown configuration property or missing property value.');
			return;
		}
		if (parent === undefined) {
			logger.showError('Unknown configuration property or missing property value.');
			return;
		}
		var parentConfig = self.conf.get('config:' + parent);
		if (!(property in parentConfig)) {
			logger.showError('Unknown configuration property or missing property value.');
			return;
		}
		delete parentConfig[property];
		self.conf.set('config:' + parent, parentConfig);
		self.saveConfig(true);
		logger.showResult(property + ' removed successfully.');
		logger.showResult(parent + ' updated successfully.');
	} else {
		logger.showError('Unknown configuration property or missing property value.');
	}
};

// Shows all wizzy configuration properties
Config.prototype.showProperty = function(config) {
	var self = this;
	self.checkConfigPrereq();
	self.conf.use('file', {file: confFile});
	var value = self.conf.get(config);
	if (value !== undefined) {
		logger.showOutput(logger.stringify(value));
	} else {
		logger.showError('No configuration found.');
	}
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
