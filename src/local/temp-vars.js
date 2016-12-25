#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('temp-var');
var Table = require('cli-table');
var _ = require('lodash');

var tempVarsDir = 'temp-vars';

function TempVars() {
	localfs.createIfNotExists(tempVarsDir, 'dir', false);
}

// checks dir status for the datasources
TempVars.prototype.checkDirStatus = function() {
	return localfs.checkExists(tempVarsDir, 'temp-vars directory', false);
}

module.exports = TempVars;