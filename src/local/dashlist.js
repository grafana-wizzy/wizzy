#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('../util/logger.js');
var logger = new Logger('Config');

var _ = require('lodash');
var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();

var confDir = 'conf';
var dashListFile = 'conf/dash-list.json';

function DashList() {
	this.nconf = require('nconf');
	this.nconf.argv().env().file({ file: dashListFile });
}

DashList.prototype.createIfNotExists = function(showResult) {
	if(!localfs.checkExists(dashListFile)) {
		localfs.createIfNotExists(dashListFile, 'file', showResult);
		if (showResult) {
			logger.showResult('dash-list file created under conf directory.');
		}
	} else {
		if (showResult) {
			logger.showResult('dash-list file already exists under conf directory.');
		}
	}
};

DashList.prototype.checkFileStatus = function(showOutput) {
	if(!localfs.checkExists(dashListFile, 'dash-list file', showOutput)) {
		return false;
	} else {
		return true;
	}
};

DashList.prototype.createList = function(commands) {
	var listName = commands[0];
	var self = this;
	self.createIfNotExists(false);
	if (!self.nconf.get('dashlists')) {
		self.nconf.set('dashlists', []);
		self.saveConfig(false);
	}
	if (_.includes(self.getListNames(),listName)) {
		logger.showOutput('Dashboard list ' + listName + ' already exists. Please choose another name.');
	} else {
		var lists = self.nconf.get('dashlists');
		lists.push({name: listName, dashboards: []});
		self.nconf.set('dashlists',lists);
		self.saveConfig(false);
		logger.showResult('Dashboard list ' + listName + ' created successfully.');
	}

};

DashList.prototype.addDashboard = function(commands) {
	var listName = commands[0];
	var self = this;
	var dashboardName = commands[1];
	var lists = self.nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		lists[listIndex].dashboards.push(dashboardName);
		self.nconf.set('dashlists',lists);
		self.saveConfig(false);
		logger.showResult('Dashboard ' + dashboardName + ' added to Dashboard list ' + listName + ' successfully.');
	}
};

DashList.prototype.removeDashboard = function(commands) {
	var listName = commands[0];
	var self = this;
	var dashboardName = commands[1];
	var lists = self.nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		_.pull(lists[listIndex].dashboards, dashboardName);
		self.nconf.set('dashlists',lists);
		self.saveConfig(false);
		logger.showResult('Dashboard ' + dashboardName + ' deleted from Dashboard list ' + listName + ' successfully.');
	}
};


DashList.prototype.showList = function(commands) {
	var listName = commands[0];
	var self = this;
	var lists = self.nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		logger.showOutput(logger.stringify(lists[listIndex]));
		logger.showResult('Dashboard list ' + listName + ' displayed successfully.');
	}
};

DashList.prototype.clearList = function(commands) {
	var listName = commands[0];
	var self = this;
	var lists = self.nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		lists[listIndex].dashboards = [];
		self.nconf.set('dashlists',lists);
		self.saveConfig(false);
		logger.showResult('Dashboard list ' + listName + ' cleared successfully.');
	}
};

DashList.prototype.deleteList = function(commands) {
	var listName = commands[0];
	var self = this;
	var lists = self.nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		lists.splice(listIndex, 1);
		self.nconf.set('dashlists',lists);
		self.saveConfig(false);
		logger.showResult('Dashboard list ' + listName + ' deleted successfully.');
	}
};

DashList.prototype.getList = function(listName) {
	var self = this;
	var lists = self.nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		return [];
	} else {
		return lists[listIndex].dashboards;
	}
};

function getListIndex(listName, lists) {
	return _.findIndex(lists, function(list) {
		if (list && list.name === listName) {
			return true;
		}
	});
}

DashList.prototype.getListNames = function() {
	var self = this;
	var lists = self.nconf.get('dashlists');
	if (lists && lists.length > 0) {
		return _.map(lists, function (list) {
			return list.name;
		});
	} else {
		return [];
	}

};

// Save dashlist config
DashList.prototype.saveConfig = function(showResult) {
	var self = this;
	self.nconf.save(function (err) {
  	localfs.readFile(dashListFile, false );
  	if (showResult) {
  		logger.showResult('Dashboard list saved.');
  	}
	});
};

module.exports = DashList;