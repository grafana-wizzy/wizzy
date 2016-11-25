#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();

var fs = require('fs');
var nconf = require('nconf');

var dashDir;
function Dashboards(dir) {
	dashDir = dir;
}

Dashboards.prototype.createIfNotExist = function() {

	// Initializing dashboard dir
	if (!fs.existsSync(dashDir)){
    fs.mkdirSync(dashDir);
    logger.showResult('dashboards directory created.')
	} else {
		logger.showResult('dashboards directory already exists.')
	}

}

Dashboards.prototype.checkDirStatus = function(dir, showWhenOk) {

	if (!fs.existsSync(dir)){
		logger.showError(dir + ' directory does not exist.');
		return false;
	} else {
		if(showWhenOk) {
			logger.showResult(dir + ' directory detected.');
		}
		return true;
	}

}

Dashboards.prototype.checkDashboardDirStatus = function() {
	return this.checkDirStatus(dashDir, false);
}

module.exports = Dashboards;