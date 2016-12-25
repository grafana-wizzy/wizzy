#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('temp-vars');
var Table = require('cli-table');
var _ = require('lodash');

var rowsDir = 'rows';

function Rows() {
	localfs.createIfNotExists(rowsDir, 'dir', false);
}

// checks dir status for the datasources
Rows.prototype.checkDirStatus = function() {
	return localfs.checkExists(rowsDir, 'temp-vars directory', false);
}

module.exports = Rows;