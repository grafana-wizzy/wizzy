#!/usr/bin/env node
"use strict";

var fs = require('fs');
var Logger = require('./logger.js');
var logger = new Logger('localfs');

function LocalFS() {}

LocalFS.prototype.checkExists = function(name, output, showOnOk) {

	if (fs.existsSync(name)){
		if (showOnOk) {
			logger.showResult(output + ' exists.');
		}
    return true;
	} else {
		if (showOnOk) {
			logger.showResult(output + ' does not exists.');
		}
		return false;
	}

}

LocalFS.prototype.createIfNotExists = function(name, output) {

	if (!fs.existsSync(name)){
    fs.mkdirSync(name);
    logger.showResult(output + ' created.');
	} else {
		logger.showResult(output + ' already exists.');
	}
	
}

module.exports = LocalFS;