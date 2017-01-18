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
	this.dashlistConf = require('nconf');
}


DashList.prototype.createIfNotExists = function(showResult) {
	var self = this;
	localfs.createDirIfNotExists(confDir, showResult);
	var dashListConfigExists = localfs.checkExists(dashListFile, 'dash-list conf file', showResult);
	if (dashListConfigExists) {
		logger.showResult('dash-list conf file already exists.');
	} else  {
		self.saveDashListConf(showResult);
		logger.showResult('dash-list conf file created.');
	}
};

DashList.prototype.createList = function(commands) {
	var self = this;
	var listName = commands[0];
	self.createIfNotExists(false);
	self.dashlistConf.use('file', {file: dashListFile});
	if (!self.dashlistConf.get('dashlists')) {
		self.dashlistConf.set('dashlists', []);
		self.saveDashListConf(false);
	}
	if (_.includes(self.getListNames(),listName)) {
		logger.showOutput('Dashboard list ' + listName + ' already exists. Please choose another name.');
	} else {
		var lists = self.dashlistConf.get('dashlists');
		lists.push({name: listName, dashboards: []});
		self.dashlistConf.set('dashlists',lists);
		self.saveDashListConf(false);
		logger.showResult('Dashboard list ' + listName + ' created successfully.');
	}

};

DashList.prototype.addDashboard = function(commands) {
	var self = this;
	var listName = commands[0];
	var dashboardName = commands[1];
	self.dashlistConf.use('file', {file: dashListFile});
	var lists = self.dashlistConf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		lists[listIndex].dashboards.push(dashboardName);
		self.dashlistConf.set('dashlists',lists);
		self.saveDashListConf(false);
		logger.showResult('Dashboard ' + dashboardName + ' added to Dashboard list ' + listName + ' successfully.');
	}
};

DashList.prototype.removeDashboard = function(commands) {
	var self = this;
	var listName = commands[0];
	var dashboardName = commands[1];
	self.dashlistConf.use('file', {file: dashListFile});
	var lists = self.dashlistConf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		_.pull(lists[listIndex].dashboards, dashboardName);
		self.dashlistConf.set('dashlists',lists);
		self.saveDashListConf(false);
		logger.showResult('Dashboard ' + dashboardName + ' deleted from Dashboard list ' + listName + ' successfully.');
	}
};


DashList.prototype.showList = function(commands) {
	var self = this;
	var listName = commands[0];
	self.dashlistConf.use('file', {file: dashListFile});
	var lists = self.dashlistConf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		logger.showOutput(logger.stringify(lists[listIndex]));
		logger.showResult('Dashboard list ' + listName + ' displayed successfully.');
	}
};

DashList.prototype.clearList = function(commands) {
	var self = this;
	var listName = commands[0];
	self.dashlistConf.use('file', {file: dashListFile});
	var lists = self.dashlistConf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		lists[listIndex].dashboards = [];
		self.dashlistConf.set('dashlists',lists);
		self.saveDashListConf(false);
		logger.showResult('Dashboard list ' + listName + ' cleared successfully.');
	}
};

DashList.prototype.deleteList = function(commands) {
	var self = this;
	var listName = commands[0];
	self.dashlistConf.use('file', {file: dashListFile});
	var lists = self.dashlistConf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		lists.splice(listIndex, 1);
		self.dashlistConf.set('dashlists',lists);
		self.saveDashListConf(false);
		logger.showResult('Dashboard list ' + listName + ' deleted successfully.');
	}
};

DashList.prototype.getList = function(listName) {
	var self = this;
	self.dashlistConf.use('file', {file: dashListFile});
	var lists = self.dashlistConf.get('dashlists');
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
	self.dashlistConf.use('file', {file: dashListFile});
	var lists = self.dashlistConf.get('dashlists');
	if (lists && lists.length > 0) {
		return _.map(lists, function (list) {
			return list.name;
		});
	} else {
		return [];
	}

};

// Save dashlist config
DashList.prototype.saveDashListConf = function(showOutput) {
	var self = this;
	self.dashlistConf.use('file', {file: dashListFile});
	self.dashlistConf.save(function (err) {
		if (err) {
			if (showOutput) {
				logger.showError('Error in saving dash-list config.');
			}
		} else {
			if (showOutput) {
				logger.showResult('dash-list configuration saved.');
			}
		}
	});
};

module.exports = DashList;