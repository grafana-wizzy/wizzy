#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('temp-vars');
var Table = require('cli-table');
var _ = require('lodash');

var panelsDir = 'panels';

function Panels() {
	localfs.createIfNotExists(panelsDir, 'dir', false);
}

// checks dir status for the panels
Panels.prototype.checkDirStatus = function(showOutput) {
	return localfs.checkExists(panelsDir, 'panels directory', showOutput);
}

module.exports = Panels;