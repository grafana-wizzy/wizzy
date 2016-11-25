#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();

var _ = require('lodash');
var request = require('request');
var body = {};

var successMessage;
var failureMessage;

var dashboards;

var url;
var auth = {};

function Grafana(conf, dash) {
	url = conf.url;
	auth.username = conf.username;
	auth.password = conf.password;
	if (conf.debug_api === true || conf.debug_api === 'true') {
		request.debug = true;
	} else {
		request.debug = false;
	}
}

Grafana.prototype.create = function(command, entityType, entityValue) {

	if (entityType === 'org') {
		body['name'] = entityValue;
		successMessage = 'Created Grafana org ' + entityValue + ' successfully.';
		failureMessage = 'Error in creating Grafana org ' + entityValue + '.';
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	createURL(command, entityType, entityValue);
	sendRequest('POST');
	
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
	createURL(command, entityType, entityValue);
	sendRequest('DELETE');

}

Grafana.prototype.show = function(command, entityType, entityValue) {

	createURL(command, entityType, entityValue);
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

Grafana.prototype.summarize = function(command, entityType, entityValue) {

	createURL(command, entityType, entityValue);
	if (entityType === 'dashboard') {
		successMessage = 'Showed dashboard ' + entityValue + ' summary successfully.';
		failureMessage = 'Error in showing dashboard ' + entityValue + 'summary.';
		var summarizedOutput = logger.stringify(extractDashArch(readDashboard(entityValue)), null, 2);
		logger.showOutput(summarizedOutput);
		logger.showResult(successMessage);
		return;
	}	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}

}

Grafana.prototype.import = function(command, entityType, entityValue) {

	if (entityType === 'dashboard') {
		successMessage = 'Dashboard '+ entityValue + ' import successful.';
		failureMessage = 'Dashboard '+ entityValue + ' import failed.';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	createURL(command, entityType, entityValue);
	request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
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
	createURL(command, entityType, entityValue);
	sendRequest('POST');

}

// Create url for calling Grafana API
function createURL(command, entityType, entityValue) {

	// Editing URL depending on entityType
	if (entityType === 'org' || entityType === 'orgs') {
		url += '/api/orgs';
	} else if (entityType === 'dashboard' || entityType === 'newdash' || entityType === 'dasharch') {
		url += '/api/dashboards/db';
	}

	// Editing URL depending on command
	if (command === 'import' || command === 'delete' ||
	 		(command === 'show' && 
	 			(entityType === 'dashboard' || entityType === 'dasharch' || entityType === 'org'))){
		url += '/' + entityValue;
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

// Saves a dashboard json in a file.
function saveDashboard(slug, dashboard) {
	var dashFile = dashDir + '/' + slug + '.json';
	fs.writeFileSync(dashFile, logger.stringify(dashboard, null, 2));
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
function extractDashArch(dashboard) {
	var arch = {};

	// Extracting row information
	arch.title = dashboard.title;
	arch.rowCount = _.size(dashboard.rows);
	arch.rows = [];
	_.forEach(dashboard.rows, function(row) {
		arch.rows.push({
  		title: row.title,
			panelCount: _.size(row.panels),
			panelTitles: _.join(_.map(row.panels,'title'), ', ')
		});
	});
	if ('templating' in dashboard) {
		arch.templateVariableCount = _.size(dashboard.templating.list);
		arch.templateValiableNames = _.join(_.map(dashboard.templating.list, 'name'), ', ');
	}
	arch.time = dashboard.time;
	arch.time.timezone = dashboard.timezone;
	return arch;
}

module.exports = Grafana;