#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('../util/logger.js');
var logger = new Logger('Config');

var _ = require('lodash');
var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var nconf = require('nconf');

var confDir = 'conf';
var dashListFile = 'conf/dash-list.json';

function DashList() {
	nconf.argv().env().file({ file: dashListFile });
}

DashList.prototype.createIfNotExists = function(showResult) {
	localfs.createIfNotExists(confDir, 'dir', showResult);
	if(!localfs.checkExists(dashListFile)) {
		saveConfig(false);
		if (showResult) {
			logger.showResult('dash-list file created under conf directory.');
		}
	} else {
		if (showResult) {
			logger.showResult('dash-list file already exists under conf directory.');
		}
	}
};

DashList.prototype.checkExists = function(showOutput) {
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
	if (!nconf.get('dashlists')) {
		nconf.set('dashlists', []);
		saveConfig(false);
	}
	if (_.includes(getListNames(),listName)) {
		logger.showOutput('Dashboard list ' + listName + ' already exists. Please choose another name.');
	} else {
		var lists = nconf.get('dashlists');
		lists.push({name: listName, dashboards: []});
		nconf.set('dashlists',lists);
		saveConfig(false);
		logger.showResult('Dashboard list ' + listName + ' created successfully.');
	}

};

DashList.prototype.addDashboard = function(commands) {

	var listName = commands[0];
	var dashboardName = commands[1];
	var lists = nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		lists[listIndex].dashboards.push(dashboardName);
		nconf.set('dashlists',lists);
		saveConfig(false);
		logger.showResult('Dashboard ' + dashboardName + ' added to Dashboard list ' + listName + ' successfully.');
	}
};

DashList.prototype.removeDashboard = function(commands) {

	var listName = commands[0];
	var dashboardName = commands[1];
	var lists = nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		_.pull(lists[listIndex].dashboards, dashboardName);
		nconf.set('dashlists',lists);
		saveConfig(false);
		logger.showResult('Dashboard ' + dashboardName + ' deleted from Dashboard list ' + listName + ' successfully.');
	}
};


DashList.prototype.showList = function(commands) {

	var listName = commands[0];
	var lists = nconf.get('dashlists');
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
	var lists = nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		lists[listIndex].dashboards = [];
		nconf.set('dashlists',lists);
		saveConfig(false);
		logger.showResult('Dashboard list ' + listName + ' cleared successfully.');
	}
};

DashList.prototype.deleteList = function(commands) {

	var listName = commands[0];
	var lists = nconf.get('dashlists');
	var listIndex = getListIndex(listName, lists);
	if (listIndex === -1) {
		logger.showError('Dashboard list ' + listName + ' does not exist. Please create a dashboard list first.');
	} else {
		lists.splice(listIndex, 1);
		nconf.set('dashlists',lists);
		saveConfig(false);
		logger.showResult('Dashboard list ' + listName + ' deleted successfully.');
	}
};

function getListIndex(listName, lists) {

	return _.findIndex(lists, function(list) {
		if (list && list.name === listName) {
			return true;
		}
	});

}

function getListNames() {

	var lists = nconf.get('dashlists');
	if (lists && lists.length > 0) {
		return _.map(lists, function (list) {
			return list.name;
		});
	} else {
		return [];
	}

}

// Save dashlist config
function saveConfig(showResult) {

	nconf.save(function (err) {
  	localfs.readFile(dashListFile, false );
  	if (showResult) {
  		logger.showResult('Dashboard list saved.');
  	}
	});
}

module.exports = DashList;