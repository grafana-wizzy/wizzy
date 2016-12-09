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

LocalFS.prototype.createIfNotExists = function(name, type, output) {

	if (!fs.existsSync(name)){
		if (type === 'dir') {
			fs.mkdirSync(name);
		} else if (type === 'file') {
			
		}
    logger.showResult(output + ' created.');
	} else {
		logger.showResult(output + ' already exists.');
	}
	
}

LocalFS.prototype.readFile = function(name, showOnError) {

	return fs.readFileSync(name, 'utf8', function (error, data) {
		if (!error) {
			logger.showResult('Read file ' + name + ' successfully.');
		}
		else {
			logger.showError('Error in reading file ' + name);
		}
	});

}

LocalFS.prototype.writeFile = function(name, content) {

	fs.writeFileSync(name, content);

}

LocalFS.prototype.readFilesFromDir = function(dirName) {

	return fs.readdirSync(dirName);

}

module.exports = LocalFS;