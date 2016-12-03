#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();

var _ = require('lodash');
var request = require('request');
var Table = require('cli-table');

var successMessage;
var failureMessage;

var dashboards;

var url;
var auth = {};
var body = {};

function Grafana(conf, dash) {
	url = conf.url;
	auth.username = conf.username;
	auth.password = conf.password;
	if (conf.debug_api === true || conf.debug_api === 'true') {
		request.debug = true;
	} else {
		request.debug = false;
	}
	dashboards = dash;
}

Grafana.prototype.create = function(entityType, entityValue) {

	if (entityType === 'org') {
		body['name'] = entityValue;
		successMessage = 'Created Grafana org ' + entityValue + ' successfully.';
		failureMessage = 'Error in creating Grafana org ' + entityValue + '.';
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	createURL('create', entityType, entityValue);
	sendRequest('POST');
	
}

Grafana.prototype.delete = function(entityType, entityValue) {

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
	createURL('delete', entityType, entityValue);
	sendRequest('DELETE');

}

Grafana.prototype.show = function(entityType, entityValue) {

	createURL('show', entityType, entityValue);
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
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode == 200) {
	  	  output += logger.stringify(extractDashArch(body));
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
	sendRequest('GET');

}

Grafana.prototype.import = function(entityType, entityValue) {

	if (entityType === 'dashboard') {
		successMessage = 'Dashboard '+ entityValue + ' import successful.';
		failureMessage = 'Dashboard '+ entityValue + ' import failed.';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	createURL('import', entityType, entityValue);
	request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
		var output = '';
		if (!error && response.statusCode == 200) {
  	  output += body;
			dashboards.saveDashboard(entityValue, body.dashboard);
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

Grafana.prototype.export = function(entityType, entityValue) {

	if (entityType === 'dashboard' || entityType === 'new-dashboard') {
		var dashBody = {
			dashboard: dashboards.readDashboard(entityValue),
			overwrite: true
		}
		if (entityType === 'new-dashboard') {
			dashBody.dashboard.id = null;
		}
		successMessage = 'Dashboard '+ entityValue + ' export successful.';
		failureMessage = 'Dashboard '+ entityValue + ' export failed.';
		body = dashBody;
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	createURL('export', entityType, entityValue);
	sendRequest('POST');

}

Grafana.prototype.list = function(entityType) {

	if (entityType === 'dashboards') {
		successMessage = 'Displayed dashboards list successfully.';
		failureMessage = 'Dashboards list display failed';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	createURL('list', entityType);
	request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
		var output = '';
		if (!error && response.statusCode == 200) {
			var table = new Table({
    		head: ['Title', 'Slug'],
  			colWidths: [50, 50]
			});
			_.each(body, function(dashboard){
				table.push([dashboard.title, dashboard.uri.substring(3)]); //removing db/
			});
			output += table.toString();
  	  logger.showOutput(output);
  	  logger.showResult('Total dashboards: ' + body.length);
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

// Create url for calling Grafana API
function createURL(command, entityType, entityValue) {

	// Editing URL depending on entityType
	if (entityType === 'org' || entityType === 'orgs') {
		url += '/api/orgs';
	} else if (entityType === 'dashboard' || entityType === 'new-dashboard') {
		url += '/api/dashboards/db';
	}

	// Editing URL depending on command
	if (command === 'import' || command === 'delete' ||
	 		(command === 'show' && 
	 			(entityType === 'dashboard' || entityType === 'org'))){
		url += '/' + entityValue;
	}

	if (command === 'list' && entityType === 'dashboards') {
		url += '/api/search';
	}

}

// Sends an HTTP API request to Grafana
function sendRequest(method) {
	
	if (method === 'POST') {
		request.post({url: url, auth: auth, json: true, body: body}, printResponse); 
	} else if (method === 'GET') {
		request.get({url: url, auth: auth, json: true, method: method}, printResponse);
	} else if (method === 'DELETE') {
		request.delete({url: url, auth: auth, json: true, method: method}, printResponse);
	}
	
}

// Handles HTTP response from Grafana
function printResponse(error, response, body) {
	var output = '';
		if (!error && response.statusCode == 200) {
  	  output += logger.stringify(body);
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
}

module.exports = Grafana;