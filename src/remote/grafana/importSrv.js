#!/usr/bin/env node
"use strict";

var request = require('request');
var Logger = require('../../util/logger.js');
var logger = new Logger('importSrv');
var _ = require('lodash');
var components;

function ImportSrv(comps) {
	components = comps;
}

ImportSrv.prototype.dashboard = function(grafanaURL, options, dashboardName) {
	var successMessage = 'Dashboard '+ dashboardName + ' import successful.';
	var failureMessage = 'Dashboard '+ dashboardName + ' import failed.';
	var output = '';
	options.url = createURL(grafanaURL, 'dashboard', dashboardName);
	options.json = true;
	request.get(options, function saveHandler(error, response, body) {
		if (!error && response.statusCode === 200) {
  	  output += body;
			components.dashboards.saveDashboard(dashboardName, body.dashboard, true);
    	logger.showResult(successMessage);
		} else {
			if (response !== null){
				output += 'Grafana API response status code = ' + response.statusCode;
			}

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

};

ImportSrv.prototype.dashboards = function(grafanaURL, options) {
	var successMessage = 'Dashboards import successful.';
	var failureMessage = 'Dashboards import failed.';
	var output = '';
	options.url = createURL(grafanaURL, 'dashboards');
	options.json = true;
	request.get(options, function saveHandler(error, response, body) {
		var dashList = [];
		if (!error && response.statusCode === 200) {
			_.each(body, function(dashboard){
				dashList.push(dashboard.uri.substring(3)); //removing db/
			});
  	  _.each(dashList, function(dash){
  	  	options.url = createURL(grafanaURL, 'dashboard', dash);
  	  	request.get(options, function saveHandler(error, response, body) {
					if (!error && response.statusCode === 200) {
						components.dashboards.saveDashboard(dash, body.dashboard, false);
			  	}
				});
  	  });
  	  logger.showResult('Total dashboards imported: ' + dashList.length);
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
};

ImportSrv.prototype.org = function(grafanaURL, options, orgName) {
	var successMessage = 'Org '+ orgName + ' import successful.';
	var	failureMessage = 'Org '+ orgName + ' import failed.';
	var output = '';
	options.url = createURL(grafanaURL, 'org', orgName);
	options.json = true;
	request.get(options, function saveHandler(error, response, body) {
		if (!error && response.statusCode === 200) {
  	  output += body;
  	  components.orgs.saveOrg(orgName, body, true);
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
};

ImportSrv.prototype.orgs = function(grafanaURL, options) {
	var successMessage = 'Orgs import successful.';
	var	failureMessage = 'Orgs import failed.';
	var output = '';
	options.url = createURL(grafanaURL, 'orgs');
	options.json = true;
	request.get(options, function saveHandler(error, response, body) {
		var orgList = [];
		if (!error && response.statusCode === 200) {
			_.each(body, function(org){
				orgList.push(org.id);
			});
			_.each(orgList, function(id) {
				options.url = createURL(grafanaURL, 'org', id);
				request.get(options, function saveHandler(error, response, body) {
					if (!error && response.statusCode === 200) {
						components.orgs.saveOrg(id, body, false);
			  	}
				});
			});
  	  logger.showResult('Total orgs imported: ' + body.length);
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
};

ImportSrv.prototype.datasource = function(grafanaURL, options, datasourceName) {
	var successMessage = 'Datasource '+ datasourceName + ' import successful.';
	var failureMessage = 'Datasource '+ datasourceName + ' import failed.';
	var output = '';
	options.url = createURL(grafanaURL, 'datasource', datasourceName);
	options.json = true;
	request.get(options, function saveHandler(error, response, body) {
		if (!error && response.statusCode === 200) {
  	  output += body;
  	  delete body.id;
  	  components.datasources.saveDatasource(datasourceName, body, true);
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
};

ImportSrv.prototype.datasources = function(grafanaURL, options) {
	var successMessage = 'Datasources import successful.';
	var	failureMessage = 'Datasources import failed.';
	var output = '';
	options.url = createURL(grafanaURL, 'datasources');
	options.json = true;
	request.get(options, function saveHandler(error, response, body) {
		if (!error && response.statusCode === 200) {
			_.each(body, function(datasource){
				delete datasource.id;
				components.datasources.saveDatasource(datasource.name, datasource, false);
			});
  	  logger.showResult('Total datasources imported: ' + body.length);
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
};

function createURL(grafanaURL, entityType, entityValue) {

	if (entityType === 'dashboard') {
		grafanaURL += '/api/dashboards/db/' + entityValue;
	} else if (entityType === 'dashboards') {
		grafanaURL += '/api/search';
	} else if (entityType === 'org') {
		grafanaURL += '/api/orgs/' + entityValue;
	} else if (entityType === 'orgs') {
		grafanaURL += '/api/orgs';
	} else if (entityType === 'datasources') {
		grafanaURL += '/api/datasources';
	} else if (entityType === 'datasource') {
		grafanaURL += '/api/datasources/name/' + entityValue;
	}

	return grafanaURL;

}

module.exports = ImportSrv;