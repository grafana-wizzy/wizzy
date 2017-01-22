#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('../util/logger.js');
var logger = new Logger('grafana');
var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var DashList = require('../local/dashlist.js');

var Import = require('./grafana/importSrv.js');
var importSrv;

var syncReq = require('sync-request');

var _ = require('lodash');
var request = require('request');
var Table = require('cli-table');

var GIFEncoder = require('gifencoder');
var encoder;
var pngFileStream = require('png-file-stream');

function Grafana(conf, comps) {
	if (conf && conf.grafana) {
		if (conf.grafana.url) {
			this.grafanaUrl = conf.grafana.url;
		}
		if (conf.grafana.username && conf.grafana.password) {
			this.auth = {
				username: conf.grafana.username,
				password: conf.grafana.password
			};
		}
		if (conf.grafana.headers) {
			this.headers = conf.grafana.headers;
		}
		if (conf.grafana.authorization) {
			this.authorization = conf.grafana.authorization;
		}
	}
	if (comps) {
		this.components = comps;
		importSrv = new Import(this.components);
	}
	if (conf && conf.clip) {
		this.clipConfig = conf.clip;
	}
}

// creates an org
Grafana.prototype.create = function(commands) {
	
	var self = this;
	var successMessage;
	var failureMessage;
	var entityType = commands[0];
	var entityValue = commands[1];
	var body;

	if (entityType === 'org') {
		body.name = entityValue;
		successMessage = 'Created Grafana org ' + entityValue + ' successfully.';
		failureMessage = 'Error in creating Grafana org ' + entityValue + '.';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}

	var url = self.grafanaUrl + self.createURL('create', entityType, entityValue);
	request.post({url: url, auth: self.auth, headers: self.headers, json: true, body: body}, function printResponse(error, response, body) {
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
			logger.showError(failureMessage);
		}
	});

};

// deletes a dashboard or an org
Grafana.prototype.delete = function(commands) {

	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];
	var successMessage;
	var failureMessage;

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
	var url = self.grafanaUrl + self.createURL('delete', entityType, entityValue);
	request.delete({url: url, auth: self.auth, headers: self.headers, json: true}, printResponse);
	logger.showResult(successMessage);

};

// shows Grafana entities
Grafana.prototype.show = function(commands) {

	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];

	var url = self.grafanaUrl + self.createURL('show', entityType, entityValue);
	request.get({url: url, auth: self.auth, headers: self.headers, json: true}, printResponse);

};

// Switches an org
Grafana.prototype.switch = function(commands) {
	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];
	var successMessage = 'Org switched to ' + entityValue + ' successfully.';
	var failureMessage = 'Org switch to ' + entityValue + ' failed.';
	if (entityType !== 'org') {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	var url = self.grafanaUrl + self.createURL('switch', entityType, entityValue);
	request.post({url: url, auth: self.auth, headers: self.headers}, function saveHandler(error, response, body) {
		if (error) {
			logger.showOutput(error);
			logger.showError(failureMessage);
		} else {
			logger.showOutput(body);
			if (response.statusCode === 200) {
				logger.showResult(successMessage);
			} else {
				logger.showError(failureMessage);
			}
		}
	});
};

// imports a dashboard or all dashboards from Grafana
Grafana.prototype.import = function(commands) {

	var self = this;
	var successMessage;
	var failureMessage;
	var entityType = commands[0];
	var entityValue = commands[1];
	var url;
	var output = '';

	// imports a dashboard from Grafana
	if (entityType === 'dashboard') {
		importSrv.dashboard(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// import all dashboards from Grafana
	else if (entityType === 'dashboards') {
		importSrv.dashboards(self.grafanaUrl, self.setURLOptions());
	}
	// imports an org from Grafana
	else if (entityType === 'org') {
		importSrv.org(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// imports all orgs from Grafana
	else if (entityType === 'orgs') {
		importSrv.orgs(self.grafanaUrl, self.setURLOptions());
	}
	// import a datasource from Grafana
	else if (entityType === 'datasource') {
		importSrv.datasource(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// import all datasources from Grafana
	else if (entityType === 'datasources') {
		importSrv.datasources(self.grafanaUrl, self.setURLOptions());
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
};

// export a dashboard to Grafana
Grafana.prototype.export = function(commands) {

	var self = this;
	var successMessage;
	var failureMessage;
	var entityType = commands[0];
	var entityValue = commands[1];
	var url;
	var body;

	// exporting a dashboard to Grafana
	if (entityType === 'dashboard') {

		successMessage = 'Dashboard '+ entityValue + ' export successful.';
		failureMessage = 'Dashboard '+ entityValue + ' export failed.';

		var url_check = self.grafanaUrl + self.createURL('show', 'dashboard', entityValue);
		request.get({url: url_check, auth: self.auth, headers: self.headers, json: true}, function saveHandler(error_check, response_check, body_check) {
			// this means that dashboard does not exist so will create a new one
			var dashBody = {
				dashboard: self.components.dashboards.readDashboard(entityValue),
				overwrite: true
			};
			if (response_check.statusCode === 404) {
				dashBody.dashboard.id = null;
			} else {
				dashBody.dashboard.id = body_check.dashboard.id;
			}
			var url = self.grafanaUrl + self.createURL('export', entityType, null);
			request.post({url: url, auth: self.auth, headers: self.headers, json: true, body: dashBody}, printResponse);
		});
		logger.showResult(successMessage);

	}

  // exporting all local dashbaords to Grafana
	else if (entityType === 'dashboards') {
		logger.showResult('Exporting dashboards to Grafana.');
		var dashboards = self.components.readEntityNamesFromDir('dashboards');
		_.forEach(dashboards,function(dashboard){
			var url_check = self.grafanaUrl + self.createURL('show', 'dashboard', dashboard);
			request.get({url: url_check, auth: self.auth, headers: self.headers, json: true}, function saveHandler(error_check, response_check, body_check) {
				var dashBody = {
						dashboard: self.components.dashboards.readDashboard(dashboard),
						overwrite: true
				};
				if (response_check.statusCode === 404) {
					dashBody.dashboard.id = null;
				} else {
					dashBody.dashboard.id = body_check.dashboard.id;
				}
				var url = self.grafanaUrl + self.createURL('export', 'dashboard', dashboard);
				request.post({url: url, auth: self.auth, headers: self.headers, json: true, body: dashBody}, printResponse);
			});
		});
	}

	// exporting a local org to Grafana
	else if (entityType === 'org') {
		body = self.components.orgs.readOrg(entityValue);
		successMessage = 'Org '+ entityValue + ' export successful.';
		failureMessage = 'Org '+ entityValue + ' export failed.';
		url = self.grafanaUrl + self.createURL('export', entityType, entityValue);
		request.put({url: url, auth: self.auth, headers: self.headers, json: true, body: body}, printResponse);
		logger.showResult(successMessage);
	}

	// exporting a single local datasource to Grafana
	else if (entityType === 'datasource') {
		body = self.components.datasources.readDatasource(entityValue);
		successMessage = 'Datasource '+ entityValue + ' export successful.';
		failureMessage = 'Datasource '+ entityValue + ' export failed.';
		var checkDsUrl = self.grafanaUrl + self.createURL('show', entityType, entityValue);
		request.get({url: checkDsUrl, auth: self.auth, headers: self.headers, json:true}, function checkHandler(error_check, response_check, body_check) {
			var url;
			if (response_check.statusCode === 404) {
				logger.justShow('Datasource does not exists in Grafana.');
				logger.justShow('Trying to create a new datasource.');
				delete body.id;
				url = self.grafanaUrl + self.createURL('export', 'datasources', null);
				request.post({url: url, auth: self.auth, headers: self.headers, json: true, body: body}, printResponse);
			} else if (response_check.statusCode === 200) {
				url = self.grafanaUrl + self.createURL('export', entityType, body_check.id);
				request.put({url: url, auth: self.auth, headers: self.headers, json: true, body: body}, printResponse);
			} else {
				logger.showError('Unknown response from Grafana.');
			}
		});
		logger.showResult(successMessage);
	}

	// exporting all local datasources to Grafana
	else if (entityType === 'datasources') {

		var dsNames = self.components.readEntityNamesFromDir('datasources');
		url = self.grafanaUrl + self.createURL('export', 'datasources', null);
		var failed = 0;
		var success = 0;

		request.get({url: url, auth: self.auth, headers: self.headers, json: true}, function saveHandler(error_check, response_check, body_check) {
			// Getting existing list of datasources and making a mapping of names to ids
			var ids = {};
			_.forEach(body_check, function(datasource) {
				ids[datasource.name] = datasource.id;
			});

			// Here we try exporting (either updating or creating) a datasource
			_.forEach(dsNames, function(ds) {
				var url;
				var method;
				body = self.components.datasources.readDatasource(ds);
				// if local dashboard exists in Grafana we update
				if (body.name in ids) {
					body.id = ids[body.name];
					url = self.grafanaUrl + self.createURL('export', 'datasource', body.id);
					url = self.addAuthToSyncRequest(url);
					method = 'PUT';
				}
				// otherwise we create the datasource
				else {
  					delete body.id;
  					url = self.grafanaUrl + self.createURL('export', 'datasources', null);
					url = self.addAuthToSyncRequest(url);
					method = 'POST';
	  			}
		  		// Use sync-request to avoid table lockdown
		  		var response = syncReq(method, url, {json: body});
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
	}

	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}

};

// list all dashboards
Grafana.prototype.list = function(commands) {

	var self = this;
	var successMessage;
	var failureMessage;
	var entityType = commands[0];
	var url;
	if (entityType === 'dashboards') {
		successMessage = 'Displayed dashboards list successfully.';
		failureMessage = 'Dashboards list display failed';
		url = self.grafanaUrl + self.createURL('list', entityType);
		request.get({url: url, auth: self.auth, headers: self.headers, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode === 200) {
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
	} else if (entityType === 'dash-tags') {
		successMessage = 'Displayed dashboard tags list successfully.';
		failureMessage = 'Dashboard tags list display failed';
		url = self.grafanaUrl + this.createURL('list', entityType);
		request.get({url: url, auth: self.auth, headers: self.headers, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode === 200) {
				var table = new Table({
	    		head: ['Tag', 'Count'],
	  			colWidths: [50, 50]
				});
				_.each(body, function(tag){
					table.push([tag.term, tag.count]);
				});
				output += table.toString();
	  	 		logger.showOutput(output);
	  	  		logger.showResult('Total dashboard tags: ' + body.length);
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
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}

};

// Creates a 8 second clip of a dashboard for last 24 hours
Grafana.prototype.clip = function(commands) {

	var self = this;
	if (!self.clipConfig || self.clipConfig.length < 6) {
		logger.showError('Clip configs not set. Please set all 6 clip config properties stated in README.');
		return;
	}

	var entityType = commands[0];
	var entityValue = commands[1];
	var url;

	localfs.createDirIfNotExists('temp', true);

	if (entityType === 'dashboard') {

		url = self.grafanaUrl + self.createURL('clip', entityType, entityValue) +
			'?width=' + self.clipConfig.render_width + '&height=' + self.clipConfig.render_height + '&timeout=' +
			self.clipConfig.render_timeout;
		url = self.addAuthToSyncRequest(url);

		var now = (new Date()).getTime();

		// Taking 24 screenshots
		logger.justShow('Taking 24 snapshots.');

		var i = 0;
		while(i < 24) {
			var from = now - ((i + 1) * 60 * 60000);
			var to = now - (i * 60 * 60000);
			var completeUrl = url + '&from=' + from + '&to=' + to;
			var response = syncReq('GET', completeUrl);
			var filename = 'temp/' + String.fromCharCode(120 - i) + '.png';
			localfs.writeFile(filename, response.getBody());
			i++;
			logger.showResult('Took snapshot ' + i + '.');
		}

		logger.showResult('Snapshots rendering completed.');
		logger.justShow('Waiting 5 seconds before generating clip.');
		setTimeout(self.createGif(entityValue), 5000);

	} else if (entityType === 'dashboards-by-tag') {
		var tag = commands[1];
		url = self.grafanaUrl + self.createURL('search', entityType, null) + '?tag=' + tag;
		url = self.addAuthToSyncRequest(url);
		var searchResponse = syncReq('GET', url);
		var responseBody = JSON.parse(searchResponse.getBody('utf8'));
		if (searchResponse.statusCode === 200 && responseBody.length > 0) {
			logger.showOutput('Taking dashboard snapshots.');
			var dashboards = _.each(responseBody, function (dashboard) {
				var dashName = dashboard.uri.substring(3);
				var dashUrl = self.grafanaUrl + self.createURL('clip', 'dashboard', dashName) +
					'?width=' + self.clipConfig.render_width + '&height=' + self.clipConfig.render_height + '&timeout=' +
					self.clipConfig.render_timeout;
				dashUrl = self.addAuthToSyncRequest(dashUrl);
				var response = syncReq('GET', dashUrl);
				var filename = 'temp/' + dashName + '.png';
				if (response.statusCode === 200) {
					localfs.writeFile(filename, response.getBody());
					logger.showResult('Took snapshot of ' + dashName + ' dashbaord.');
				} else {
					logger.showError('Snapshot of ' + dashName + ' dashbaord failed. Please increase timeout.');
				}
			});
		} else {
			logger.showError('No content available to make clip.');
		}
		logger.showResult('Snapshots rendering completed.');
		logger.justShow('Waiting 5 seconds before generating clip.');
		setTimeout(self.createGif(tag), 5000);
	} else if (entityType === 'dash-list') {
		var listName = commands[1];
		var dashList = new DashList();
		var list = dashList.getList(listName);
		if (list.length < 1) {
			logger.showOutput('No dashboard found in dashboard list ' + listName);
		} else {
			_.each(list, function(dashName) {
				var dashUrl = self.grafanaUrl + self.createURL('clip', 'dashboard', dashName) +
					'?width=' + self.clipConfig.render_width + '&height=' + self.clipConfig.render_height + '&timeout=' +
					self.clipConfig.render_timeout;
				dashUrl = self.addAuthToSyncRequest(dashUrl);
				var response = syncReq('GET', dashUrl);
				var filename = 'temp/' + dashName + '.png';
				if (response.statusCode === 200) {
					localfs.writeFile(filename, response.getBody());
					logger.showResult('Took snapshot of ' + dashName + ' dashbaord.');
				} else {
					logger.showError('Snapshot of ' + dashName + ' dashbaord failed. Please increase timeout.');
				}
			});
		}
		logger.showResult('Snapshots rendering completed.');
		logger.justShow('Waiting 5 seconds before generating clip.');
		setTimeout(self.createGif(listName), 5000);
	} else {
		logger.showError('Unsupported set of commands ' + commands + '.');
	}
};

Grafana.prototype.createGif = function(clipName) {
	var self = this;
	localfs.createDirIfNotExists('clips', true);
	encoder = new GIFEncoder(self.clipConfig.canvas_width, self.clipConfig.canvas_height);
	pngFileStream('temp/*.png')
		.pipe(encoder.createWriteStream({ repeat: -1, delay: parseInt(self.clipConfig.delay), quality: 40 }))
 		.pipe(localfs.writeStream('clips/' + clipName + '.gif'));
 	logger.showResult('Successfully created ' + clipName + ' clip under clips directory.');
 	logger.justShow('Please delete temp directory before creating next clip.');
 	//localfs.deleteDirRecursive('temp');
};

// Create url for calling Grafana API
Grafana.prototype.createURL = function(command, entityType, entityValue) {

	var url = '';

	// Editing URL depending on entityType
	if (entityType === 'org') {
		if (command === 'switch') {
			url += '/api/user/using/' + entityValue;
		} else {
			url += '/api/orgs';
			if (command === 'show' || command === 'delete' || command === 'import' || command === 'export') {
				url += '/' + entityValue;
			}
        }
	} else if (entityType === 'orgs') {
		url += '/api/orgs';
	} else if (entityType === 'dashboard') {
		if (command === 'clip') {
			url += '/render/dashboard/db/' + entityValue;
		} else {
			url += '/api/dashboards/db';
		}
		if (command === 'import' || command === 'delete' || command === 'show') {
			url += '/' + entityValue;
		}
	} else if (entityType === 'dashboards') {
		url += '/api/search';
	} else if (entityType === 'dashboards-by-tag') {
		url += '/api/search';
	} else if (entityType === 'dash-tags') {
		url += '/api/dashboards/tags';
	} else if (entityType === 'datasources') {
		url += '/api/datasources';
	} else if (entityType === 'datasource') {
		if (command === 'show' || command === 'import') {
			url += '/api/datasources/name/' + entityValue;
		} else if (command === 'export') {
			url += '/api/datasources/' + entityValue;
		}
	}

	return url;  			

};

// add auth to sync request
Grafana.prototype.addAuthToSyncRequest = function(url) {
	var self = this;
	// If the user didn't provide auth info, simply return the URL
	if (!self.auth) {
		return url;
	}
	var urlParts = url.split('://');
	url = urlParts[0] + '://' + self.auth.username + ':' + self.auth.password + '@' + urlParts[1];
	return url;
};

Grafana.prototype.setURLOptions = function() {
	var self = this;
	var options = {};
	if (self.auth) {
		options.auth = self.auth;
	}
	if (self.headers) {
		options.headers = self.headers;
	}
	return options;
};

// prints HTTP response from Grafana
function printResponse(error, response, body) {
	var output = '';
	if (!error && response.statusCode === 200) {
  		output += logger.stringify(body);
  		logger.showOutput(output);
	} else {
  		output += 'Grafana API response status code = ' + response.statusCode;
  		if (error === null) {
  			output += '\nNo error body from Grafana API.';
  		}
  		else {
  			output += '\n' + error;
  		}
  		logger.showOutput(output);
  	}
}

module.exports = Grafana;
