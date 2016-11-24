#!/usr/bin/env node
"use strict";

var _ = require('lodash');
var Logger = require('./logger.js');
var logger = new Logger();
var prettyjson = require('prettyjson');
var fs = require('fs');
var successMessage;
var failureMessage;
var dashDir = 'dashboards';

function Grafana(config) {
	this.url = config.url;
	this.auth = {
		'user': config.username,
		'pass': config.password
	};
	this.body = {};
	this.request = require('request');
	if (config.debug_api === true || config.debug_api === 'true') {
		this.request.debug = true;
	} else {
		this.request.debug = false;
	}
}

Grafana.prototype.create = function(command, entityType, entityValue) {

	if (entityType === 'org') {
		this.body['name'] = entityValue;
		successMessage = 'Created Grafana org ' + entityValue + ' successfully.';
		failureMessage = 'Error in creating Grafana org ' + entityValue + '.';
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	this.createURL(command, entityType, entityValue);
	this.sendRequest('POST');
	
}

Grafana.prototype.delete = function(command, entityType, entityValue) {

	if (entityType === 'org') {
		successMessage = 'Deleted Grafana org ' + entityValue + ' successfully.';
		failureMessage = 'Error in deleting Grafana org ' + entityValue + '.';
	} else if (entityType === 'dashboard') {
		successMessage = 'Deleted Grafana dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in deleting Grafana dashboard ' + entityValue + '.';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	this.createURL(command, entityType, entityValue);
	this.sendRequest('DELETE');

}

Grafana.prototype.show = function(command, entityType, entityValue) {

	this.createURL(command, entityType, entityValue);
	if (entityType === 'orgs') {
		successMessage = 'Showed orgs successfully.';
		failureMessage = 'Error in showing orgs.';
	} else if (entityType === 'org') {
		successMessage = 'Showed org ' + entityValue + ' successfully.';
		failureMessage = 'Error in showing org ' + entityValue + '.';
	} else if (entityType === 'dashboard') {
		successMessage = 'Showed dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in showing dashboard ' + entityValue + '.';
	} else if (entityType === 'dasharch') {
		successMessage = 'Showed architecture for dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in showing architecture for dashboard ' + entityValue + '.';
		this.request.get({url: this.url, auth: this.auth, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode == 200) {
	  	  output += prettyjson.render(extractDashArch(body));
	  	  logger.showOutput(output);
	    	logger.showResult(successMessage);
	  	} else {
	  		output += 'Grafana API response status code = ' + response.statusCode;
	  		if (error === null) {
	  			output += '\nNo error body from Grafana API.';	
	  		}
	  		else {
	  			output += '\n' + error;
	  		}
	  		logger.showOutput(output);
	  		logger.showError(failureMessage);
	  	}
		});
		return;
	}	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	this.sendRequest('GET');

}

Grafana.prototype.import = function(command, entityType, entityValue) {

	if (entityType === 'dashboard') {
		successMessage = 'Dashboard '+ entityValue + ' import successful.';
		failureMessage = 'Dashboard '+ entityValue + ' import failed.';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	this.createURL(command, entityType, entityValue);
	this.request.get({url: this.url, auth: this.auth, json: true}, function saveHandler(error, response, body) {
		var output = '';
		if (!error && response.statusCode == 200) {
  	  output += body;
			saveDashboard(entityValue, body.dashboard);
    	logger.showResult(successMessage);
  	} else {
  		output += 'Grafana API response status code = ' + response.statusCode;
  		if (error === null) {
  			output += '\nNo error body from Grafana API.';	
  		}
  		else {
  			output += '\n' + error;
  		}
  		logger.showOutput(output);
  		logger.showError(failureMessage);
  	}
	});
}

Grafana.prototype.export = function(command, entityType, entityValue) {

	if (entityType === 'dashboard' || entityType === 'newdash') {
		var dashBody = {
			dashboard: readDashboard(entityValue),
			overwrite: true
		}
		if (entityType === 'newdash') {
			dashBody.dashboard.id = null;
		}
		successMessage = 'Dashboard '+ entityValue + ' export successful.';
		failureMessage = 'Dashboard '+ entityValue + ' export failed.';
		this.body = dashBody;
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	this.createURL(command, entityType, entityValue);
	this.sendRequest('POST');

}

// Create url for calling Grafana API
Grafana.prototype.createURL = function(command, entityType, entityValue) {

	// Editing URL depending on entityType
	if (entityType === 'org' || entityType === 'orgs') {
		this.url += '/api/orgs';
	} else if (entityType === 'dashboard' || entityType === 'newdash' || entityType === 'dasharch') {
		this.url += '/api/dashboards/db';
	}

	// Editing URL depending on command
	if (command === 'import' || command === 'delete' ||
	 		(command === 'show' && 
	 			(entityType === 'dashboard' || entityType === 'dasharch' || entityType === 'org'))){
		this.url += '/' + entityValue;
	}

}

// Sends an HTTP API request to Grafana
Grafana.prototype.sendRequest = function(method) {
	
	if (method === 'POST') {
		this.request.post({url: this.url, auth: this.auth, json: true, body: this.body}, printResponse); 
	} else if (method === 'GET') {
		this.request.get({url: this.url, auth: this.auth, json: true, method: method}, printResponse);
	} else if (method === 'DELETE') {
		this.request.delete({url: this.url, auth: this.auth, json: true, method: method}, printResponse);
	}
	
}

// Handles HTTP response from Grafana
function printResponse(error, response, body) {
	var output = '';
		if (!error && response.statusCode == 200) {
  	  output += body;
  	  logger.showOutput(prettyjson.render(body));
    	logger.showResult(successMessage);
  	} else {
  		output += 'Grafana API response status code = ' + response.statusCode;
  		if (error === null) {
  			output += '\nNo error body from Grafana API.';	
  		}
  		else {
  			output += '\n' + error;
  		}
  		logger.showOutput(output);
  		logger.showError(failureMessage);
  	}
}

// Saves a dashboard json in a file.
function saveDashboard(slug, dashboard) {
	var dashFile = dashDir + '/' + slug + '.json';
	fs.writeFileSync(dashFile, JSON.stringify(dashboard, null, 2));
	logger.showResult(slug + ' dashboard saved successfully under dashboards directory.');
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

// Extract dashboard architecture and prints it in a user friendly style.
function extractDashArch(body) {
	var arch = {};

	// Extracting row information
	arch.title = body.dashboard.title;
	arch.rowCount = _.size(body.dashboard.rows);
	arch.rows = [];
	_.forEach(body.dashboard.rows, function(row) {
		arch.rows.push({
  		title: row.title,
			panelCount: _.size(row.panels),
			panelTitles: _.join(_.map(row.panels,'title'), ', ')
		});
	});
	if ('templating' in body.dashboard) {
		arch.templateVariableCount = _.size(body.dashboard.templating.list);
		arch.templateValiableNames = _.join(_.map(body.dashboard.templating.list, 'name'), ', ');
	}
	arch.timeAndTimezone = body.dashboard.time;
	arch.timeAndTimezone.timezone = body.dashboard.timezone;
	return arch;
}

module.exports = Grafana;