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
	if (_.includes(configs, commands[0])) {
		if (commands[0] === 'grafana' && self.getProperty('config:context:grafana')) {
			commands[0] = 'grafana:installations:' + self.getProperty('config:context:grafana');
		}
		if (values.length === 2) {
			self.conf.set('config:' + commands[0] + ':' + commands1, values[1]);
			self.saveConfig(true);
			logger.showResult(parent + ' ' + values[0] + ' updated successfully.');
		} else if (values.length === 3) {
			self.conf.set('config:' + parent + ':' + values[0] + ':' + values[1], values[2]);
			self.saveConfig(true);
			logger.showResult(parent + ' ' + values[0] + ' ' + values[1] + ' updated successfully.');
		}
	} else {
		logger.showError('Unknown configuration property.');
	}
};

// Removes an existing wizzy config property
Config.prototype.removeProperty = function(commands) {
	var self = this;
	self.checkConfigPrereq();
	self.conf.use('file', {file: confFile});
	if (_.includes(configs, parent)) {
		if (parent === 'grafana' && self.getProperty('config:context:grafana')) {
			parent = 'grafana:installations:' + self.getProperty('config:context:grafana');
		}
		if (values.length === 2) {
			var config = self.conf.get('config:' + parent);
			console.log(values[0]);
			delete config[values[0]];
			self.conf.set('config:' + parent, config);
			self.saveConfig(true);
			logger.showResult(parent + ' ' + values[0] + ' removed successfully.');
		} else if (values.length === 3) {
			var config = self.conf.get('config:' + parent + ':' + values[0]);
			delete config[values[1]];
			self.conf.set('config:' + parent + ':' + values[0] + ':' + values[1], values[2]);
			self.saveConfig(true);
			logger.showResult(parent + ' ' + values[0] + ' ' + values[1] + ' removed successfully.');
		}
	} else {
		logger.showError('Unknown configuration property.');
	}
};

// Adds a grafana installation
Config.prototype.addGrafanaInstallation = function(name) {
	var self = this;
	self.checkConfigPrereq();
	self.conf.use('file', {file: confFile});
	var installations = {};
	if (self.conf.get('config:grafana:installations')) {
		installations = self.conf.get('config:grafana:installations');
	}
	installations[name] = {};
	self.conf.set('config:grafana:installations', installations);
	self.saveConfig(true);
	logger.showResult('Grafana installation ' + name + ' added.');
};

// Removes a grafana installation
Config.prototype.removeGrafanaInstallation = function(name) {
	var self = this;
	self.checkConfigPrereq();
	self.conf.use('file', {file: confFile});
	var installations = {};
	if (self.conf.get('config:grafana:installations')) {
		installations = self.conf.get('config:grafana:installations');
	}
	if (installations[name]) {
		delete installations[name];
	} else {
		logger.justShow('Grafana installation ' + name + ' does not exists.');
		return;
	}
	self.conf.set('config:grafana:installations', installations);
	self.saveConfig(true);
	logger.showResult('Grafana installation ' + name + ' removed.');
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