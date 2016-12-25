#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('datasources');
var Table = require('cli-table');
var _ = require('lodash');

var datasrcDir = 'datasources';

function Datasources() {
	localfs.createIfNotExists(datasrcDir, 'dir', false);
}

// checks dir status for the datasources
Datasources.prototype.checkDirStatus = function() {
	return localfs.checkExists(datasrcDir, 'datasources directory', false);
}

// summarize the datasources
Datasources.prototype.summarize = function() {

	var table = new Table({
  	head: ['Datasource Name', 'Datasource Type'],
		colWidths: [30, 30]
	});

	var dsFiles = localfs.readFilesFromDir(datasrcDir);

	_.each(dsFiles, function(dsFile) {
		var ds = readDatasource(localfs.getFileName(dsFile));
		table.push([ds.name, ds.type]);
	});

	logger.showOutput(table.toString());
	logger.showResult('Total datasources: ' + dsFiles.length);

}

// reads datasource json from file.
function readDatasource(id) {

	if (localfs.checkExists(getDatasourceFile(id))) {
		return JSON.parse(localfs.readFile(getDatasourceFile(id)));
	}
	else {
		logger.showError('Datasource file ' + getDatasourceFile(id) + ' does not exist.');
		process.exit();
	}

}

// get a datasource file name
function getDatasourceFile(id) {
	return datasrcDir + '/' + id + '.json';
}

module.exports = Datasources;