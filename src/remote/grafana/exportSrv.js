#!/usr/bin/env node
"use strict";

var request = require('request');
var Logger = require('../../util/logger.js');
var logger = new Logger('exportSrv');
var _ = require('lodash');
var syncReq = require('sync-request');
var components;

function ExportSrv(comps) {
	components = comps;
}
ExportSrv.prototype.alert = function(grafanaURL, options, name) {
    var body = components.alerts.read(name);
    var successMessage = 'Alert ' + name + ' export successful.';
    var failureMessage = 'Alert ' + name + ' export failed.';
    options.url = createURL(grafanaURL, 'show-alert', name);
    request.get(options, function checkHandler(error_check, response_check, body_check) {
        if (response_check.statusCode === 404) {
            logger.justShow('Alert does not exists in Grafana.');
            logger.justShow('Trying to create a new alert.');
            delete body.id;
            options.url = createURL(grafanaURL, 'alerts');
            options.body = body;
            request.post(options, function responseHandler(error, response, body) {
                var output = '';
                if (!error && response.statusCode === 200) {
                    output += logger.stringify(body);
                    logger.showOutput(output);
                    logger.showResult(successMessage);
                } else {
                    output += 'Grafana API response status code = ' + response.statusCode;
                    if (error === null) {
                        output += '\nNo error body from Grafana API.';
                    } else {
                        output += '\n' + error;
                    }
                    logger.showOutput(output);
                    logger.showResult(failureMessage);
                }
            });
        } else if (response_check.statusCode === 200) {
            options.url = createURL(grafanaURL, 'alert', body_check.id);
            options.body = body;
            request.put(options, function responseHandler(error, response, body) {
                var output = '';
                if (!error && response.statusCode === 200) {
                    output += logger.stringify(body);
                    logger.showOutput(output);
                    logger.showResult(successMessage);
                } else {
                    output += 'Grafana API response status code = ' + response.statusCode;
                    if (error === null) {
                        output += '\nNo error body from Grafana API.';
                    } else {
                        output += '\n' + error;
                    }
                    logger.showOutput(output);
                    logger.showResult(failureMessage);
                }
            });
        } else {
            logger.showError('Unknown response from Grafana.');
        }
    });
};

ExportSrv.prototype.alerts = function(grafanaURL, options) {
    var names = components.readEntityNamesFromDir('alerts');
    options.url = createURL(grafanaURL, 'alerts');
    var failed = 0;
    var success = 0;
    request.get(options, function saveHandler(error_check, response_check, body_check) {
        // Getting existing list of alerts and making a mapping of names to ids
        var ids = {};
        _.forEach(body_check, function(alert) {
            ids[alert.name] = alert.id;
        });

        // Here we try exporting (either updating or creating) a alert
        _.forEach(names, function(name) {
            var url;
            var method;
            var body = components.alerts.read(name);
            // if local dashboard exists in Grafana we update
            if (body.name in ids) {
                body.id = ids[body.name];
                url = createURL(grafanaURL, 'alert', body.id);
                method = 'PUT';
            }
            // otherwise we create the alert
            else {
                delete body.id;
                url = createURL(grafanaURL, 'alerts');
                method = 'POST';
            }
            // Use sync-request to avoid table lockdown
            url = sanitizeUrl(url, options.auth);
            var response = syncReq(method, url, {
                json: body,
                headers: options.headers
            });
            if (response.statusCode !== 200) {
                logger.showOutput(response.getBody('utf8'));
                logger.showError('Alert ' + name + ' export failed.');
                failed++;
            } else {
                logger.showOutput(response.getBody('utf8'));
                logger.showResult('Alert ' + name + ' exported successfully.');
                success++;
            }
        });
        if (success > 0) {
            logger.showResult(success + ' alerts exported successfully.');
        }
        if (failed > 0) {
            logger.showError(failed + ' alerts export failed.');
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
};

ExportSrv.prototype.dashboard = function(grafanaURL, options, dashboardName) {
	var successMessage = 'Dashboard '+ dashboardName + ' export successful.';
	var failureMessage = 'Dashboard '+ dashboardName + ' export failed.';
	options.url = createURL(grafanaURL, 'dashboard', dashboardName);
	request.get(options, function responseHandler(error_check, response_check, body_check) {
		// this means that dashboard does not exist so will create a new one
		var dashBody = {
			dashboard: components.dashboards.readDashboard(dashboardName),
			overwrite: true
		};
		if (response_check.statusCode === 404) {
			logger.justShow('Dashboard does not exist. So, creating a new dashboard.');
			dashBody.dashboard.id = null;
		} else {
			dashBody.dashboard.id = body_check.dashboard.id;
		}
		options.url = createURL(grafanaURL, 'dashboards', dashboardName);
		options.body = dashBody;
		request.post(options, function responseHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode === 200) {
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
	  		logger.showResult(failureMessage);
	  	}
		});
	});
};

ExportSrv.prototype.dashboards = function(grafanaURL, options) {
	var dashNames = components.readEntityNamesFromDir('dashboards');
	options.url = createURL(grafanaURL, 'dashboard-search');
	var failed = 0;
	var success = 0;
	var method = 'POST';
	request.get(options, function saveHandler(error_check, response_check, body_check) {
		// Getting existing list of datasources and making a mapping of names to ids
		var dashSlugs = {};
		_.forEach(body_check, function(dashboard) {
			if (dashboard.type === 'dash-db') {
				//Removing "db/" from the uri
				dashSlugs[dashboard.uri.substring(3)] = dashboard.id;
			}
		});
		// Here we try exporting (either updating or creating) a dashboard
		_.forEach(dashNames, function(dashboard) {
			var url = createURL(grafanaURL, 'dashboards');
			url = sanitizeUrl(url, options.auth);
			var body = {
				dashboard: components.dashboards.readDashboard(dashboard),
			};
			// Updating an existing dashboard
			if (dashboard in dashSlugs) {
				body.dashboard.id = dashSlugs[dashboard];
				body.overwrite = true;
  		} else {
  			// Creating a new dashboard
  			body.dashboard.id = null;
  			body.overwrite = false;
  		}
  		// Use sync-request to avoid table lockdown
  		var response = syncReq(method, url, {json: body, headers: options.headers });
  		try {
  			logger.showOutput(response.getBody('utf8'));
  		} catch (error) {
  			logger.showOutput(response.body.toString('utf8'));
  		}
			if (response.statusCode !== 200) {
  			logger.showError('Dashboard ' + dashboard + ' export failed.');
  			failed++;
			} else {
  			logger.showResult('Dashboard ' + dashboard + ' exported successfully.');
  			success++;
			}
		});
		if (success > 0) {
			logger.showResult(success + ' dashboards exported successfully.');
		}
		if (failed > 0) {
			logger.showError(failed + ' dashboards export failed.');
			process.exit(1);
		} else {
			process.exit(0);
		}
	});
};

ExportSrv.prototype.org = function(grafanaURL, options, orgName) {
	var body = components.orgs.readOrg(orgName);
	var successMessage = 'Org '+ orgName + ' export successful.';
	var failureMessage = 'Org '+ orgName + ' export failed.';
	options.url = createURL(grafanaURL, 'org', orgName);
	options.body = body;
	request.put(options, function responseHandler(error, response, body) {
		var output = '';
		if (!error && response.statusCode === 200) {
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
  		logger.showResult(failureMessage);
	  }
	});
};

ExportSrv.prototype.orgs = function(grafanaURL, options) {
	var names = components.readEntityNamesFromDir('orgs');
	options.url = createURL(grafanaURL, 'orgs');
	var failed = 0;
	var success = 0;
	request.get(options, function saveHandler(error_check, response_check, body_check) {
		var ids = {};
		_.forEach(body_check, function(org) {
			ids[org.name] = org.id;
		});

		_.forEach(names, function(name) {
			var url;
			var method;
			var body = components.orgs.readOrg(name);
			// if local dashboard exists in Grafana we update
			if (body.name in ids) {
				body.id = ids[body.name];
				url = createURL(grafanaURL, 'org', body.id);
				method = 'PUT';
			}
			// otherwise we create the datasource
			else {
				delete body.id;
				url = createURL(grafanaURL, 'orgs');
				method = 'POST';
  		}
  		// Use sync-request to avoid table lockdown
  		url = sanitizeUrl(url, options.auth);
  		var response = syncReq(method, url, {json: body, headers: options.headers });
			logger.showOutput(response.getBody('utf8'));
  		if (response.statusCode === 200) {
				logger.showResult('Org ' + name + ' exported successfully.');
  			success++;
  		} else {
				logger.showError('Org ' + name + ' export failed.');
  			failed++;
  		}
		});
		if (success > 0) {
			logger.showResult(success + ' orgs exported successfully.');
		}
		if (failed > 0) {
			logger.showError(failed + ' orgs export failed.');
			process.exit(1);
		} else {
			process.exit(0);
		}
	});
};

ExportSrv.prototype.datasource = function(grafanaURL, options, datasourceName) {
	var body = components.datasources.readDatasource(datasourceName);
	var successMessage = 'Datasource '+ datasourceName + ' export successful.';
	var failureMessage = 'Datasource '+ datasourceName + ' export failed.';
	options.url = createURL(grafanaURL, 'show-datasource', datasourceName);
	request.get(options, function checkHandler(error_check, response_check, body_check) {
		if (response_check.statusCode === 404) {
			logger.justShow('Datasource does not exists in Grafana.');
			logger.justShow('Trying to create a new datasource.');
			delete body.id;
			options.url = createURL(grafanaURL, 'datasources');
			options.body = body;
			request.post(options, function responseHandler(error, response, body) {
				var output = '';
				if (!error && response.statusCode === 200) {
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
		  		logger.showResult(failureMessage);
			  }
			});
		} else if (response_check.statusCode === 200) {
			options.url = createURL(grafanaURL, 'datasource', body_check.id);
			options.body = body;
			request.put(options, function responseHandler(error, response, body) {
				var output = '';
				if (!error && response.statusCode === 200) {
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
		  		logger.showResult(failureMessage);
			  }
			});
		} else {
			logger.showError('Unknown response from Grafana.');
		}
	});
};

ExportSrv.prototype.datasources = function(grafanaURL, options) {
	var dsNames = components.readEntityNamesFromDir('datasources');
	options.url = createURL(grafanaURL, 'datasources');
	var failed = 0;
	var success = 0;
	request.get(options, function saveHandler(error_check, response_check, body_check) {
		// Getting existing list of datasources and making a mapping of names to ids
		var ids = {};
		_.forEach(body_check, function(datasource) {
			ids[datasource.name] = datasource.id;
		});

		// Here we try exporting (either updating or creating) a datasource
		_.forEach(dsNames, function(ds) {
			var url;
			var method;
			var body = components.datasources.readDatasource(ds);
			// if local dashboard exists in Grafana we update
			if (body.name in ids) {
				body.id = ids[body.name];
				url = createURL(grafanaURL, 'datasource', body.id);
				method = 'PUT';
			}
			// otherwise we create the datasource
			else {
				delete body.id;
				url = createURL(grafanaURL, 'datasources');
				method = 'POST';
  		}
  		// Use sync-request to avoid table lockdown
  		url = sanitizeUrl(url, options.auth);
  		var response = syncReq(method, url, {json: body, headers: options.headers });
  		if (response.statusCode !== 200) {
  			logger.showOutput(response.getBody('utf8'));
  			logger.showError('Datasource ' + ds + ' export failed.');
  			failed++;
  		} else {
  			logger.showOutput(response.getBody('utf8'));
  			logger.showResult('Datasource ' + ds + ' exported successfully.');
  			success++;
  		}
		});
		if (success > 0) {
			logger.showResult(success + ' datasources exported successfully.');
		}
		if (failed > 0) {
			logger.showError(failed + ' datasources export failed.');
			process.exit(1);
		} else {
			process.exit(0);
		}
	});
};

// add auth to sync request
function sanitizeUrl(url, auth) {
	if (auth && auth.username && auth.password) {
		var urlParts = url.split('://');
		return urlParts[0] + '://' + auth.username + ':' + auth.password + '@' + urlParts[1];
	} else {
		return url;
	}
}

function createURL(grafanaURL, entityType, entityValue) {
	if (entityType === 'dashboard') {
		grafanaURL += '/api/dashboards/db/' + entityValue;
	} else if (entityType === 'dashboards') {
		grafanaURL += '/api/dashboards/db/';
	} else if (entityType === 'dashboard-search') {
		grafanaURL += '/api/search';
	} else if (entityType === 'org') {
		grafanaURL += '/api/orgs/' + entityValue;
	} else if (entityType === 'orgs') {
		grafanaURL += '/api/orgs';
	} else if (entityType === 'show-datasource') {
		grafanaURL += '/api/datasources/name/' + entityValue;
	} else if (entityType === 'datasource') {
		grafanaURL += '/api/datasources/' + entityValue;
	} else if (entityType === 'datasources') {
		grafanaURL += '/api/datasources';
	} else if (entityType === 'alert') {
		grafanaURL += '/api/alert-notifications/' + entityValue;
	} else if (entityType === 'alerts') {
		grafanaURL += '/api/alert-notifications';
	}
	return grafanaURL;
}

module.exports = ExportSrv;
