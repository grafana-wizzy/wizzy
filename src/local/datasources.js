#!/usr/bin/env node
"use strict";

var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var Logger = require('../util/logger.js');
var logger = new Logger('datasources');
var Table = require('cli-table');
var _ = require('lodash');

var datasrcDir = 'datasources';

function Datasources() {}

// summarize the datasources
Datasources.prototype.summarize = function() {

	var self = this;

	var table = new Table({
  	head: ['Datasource Name', 'Datasource Type'],
		colWidths: [30, 30]
	});

	var dsFiles = localfs.readFilesFromDir(datasrcDir);

	_.each(dsFiles, function(dsFile) {
		var ds = self.readDatasource(localfs.getFileName(dsFile));
		table.push([ds.name, ds.type]);
	});

	logger.showOutput(table.toString());
	logger.showResult('Total datasources: ' + dsFiles.length);

};

// Saves a datasource file under datasources directory on disk
Datasources.prototype.saveDatasource = function(id, datasource, showResult) {
	localfs.createDirIfNotExists(datasrcDir, showResult);
	localfs.writeFile(getDatasourceFile(id), logger.stringify(datasource, null, 2));
	if (showResult) {
		logger.showResult('Datasource ' + id + ' saved successfully under datasources directory.');
	}

};

// reads datasource json from file.
Datasources.prototype.readDatasource = function(id) {

	if (localfs.checkExists(getDatasourceFile(id))) {
		return JSON.parse(localfs.readFile(getDatasourceFile(id)));
	}
	else {
		logger.showError('Datasource file ' + getDatasourceFile(id) + ' does not exist.');
		process.exit();
	}

};

// get a datasource file name
function getDatasourceFile(id) {
	return datasrcDir + '/' + id + '.json';
}

module.exports = Datasources;