#!/usr/bin/env node
"use strict";

var Logger = require('./logger.js');
var dashDir = 'dashboards';
var request = require('request');
//request.debug = true;
var fs = require('fs');
var logger = new Logger();
var url;

function Grafana(config) {
	url = config.url;
	this.auth = {
		'user': config.username,
		'pass': config.password
	};
	this.body = {};
}

Grafana.prototype.create = function(entityType, entityValue) {

	createURL('create', entityType, entityValue);
	this.body['name'] = entityValue;

	request.post(url, {auth: this.auth, body: this.body, json: true}, function(error, response, body) {

		var output = '';
		if (!error && response.statusCode == 200) {
  	  output += body;
  	  logger.showOutput(output);
    	logger.showResult('Org creation successful.');
  	} else {
  		output += '  Grafana API response status code = ' + response.statusCode;
  		if (error === null) {
  			output += '\n  No error body from Grafana API.';	
  		}
  		else {
  			output += '\n' + error;
  		}
  		logger.showOutput(output);
  		logger.showError('Org creation failed.');
  	}
	});

}

Grafana.prototype.import = function(entityType, entityValue) {

	createURL('import', entityType, entityValue);

	request.get({url: url, auth: this.auth, json: true}, function(error, response, body){
		if (!error && response.statusCode == 200) {
			saveDashboard(entityValue, body.dashboard);
		} else {
			if (!error) {
				console.error(error);
			} else if (response.statusCode != 200) {
				console.error(body);
			}
			logger.showError('Unable to import dashboard from Grafana.');
		}
	});
}

Grafana.prototype.export = function(entityType, entityValue) {

	createURL('export', entityType, entityValue);

	var dashBody = {
		dashboard: readDashboard(entityValue),
		overwrite: true
	}

	if (entityType === 'new-dashboard') {
		dashBody.dashboard.id = null;
	}

	request.post({url: url, auth: this.auth, body: dashBody, json: true}, function(error, response, body){
		if (!error && response.statusCode == 200) {
			logger.showResult('Successfully exported dashboard to Grafana.');
		} else {
			if (!error) {
				console.error(error);
			} else if (response.statusCode != 200) {
				console.error(body);
			}
			logger.showError('Unable to export dashboard to Grafana.');
		}
	});
}

// Create url for calling Grafana API
function createURL(command, entityType, entityValue) {

	// Editing URL depending on entityType
	switch(entityType) {
		case 'org':
			url += '/api/orgs';
			break;
		case 'dashboard':
			url += '/api/dashboards/db';
			break;
		case 'new-dashboard':
			url += '/api/dashboards/db';
			break;
	}

	// Editing URL depending on command
	switch(command) {
		case 'import':
			url += '/' + entityValue;
			break;
	}

}

// Saves a dashboard json in a file.
function saveDashboard(slug, dashboard) {
	var dashFile = dashDir + '/' + slug + '.json';
	fs.writeFileSync(dashFile, JSON.stringify(dashboard, null, 2));
	logger.showResult(slug + ' dashboard imported successfully, please check dashboards directory.');
}

// Reads dashboard json from file.
function readDashboard(slug) {
	var dashFile = dashDir + '/' + slug + '.json';
	var dashboard = JSON.parse(fs.readFileSync(dashFile, 'utf8', function (error, data) {
		if (!error) {
			logger.showResult('Verified file ' + slug + ' as a valid JSON.');
		}
		else {
			logger.showError(slug + '.json file is not a valid JSON.');
			process.exit();
		}
	}));
	return dashboard;
}

module.exports = Grafana;