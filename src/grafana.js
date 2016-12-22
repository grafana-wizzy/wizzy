#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();
var LocalFS = require('./localfs.js');
var localfs = new LocalFS();
var syncReq = require('sync-request');

var _ = require('lodash');
var request = require('request');
var Table = require('cli-table');

var GIFEncoder = require('gifencoder');
var encoder;
var pngFileStream = require('png-file-stream');

var successMessage;
var failureMessage;

var components;
var config;

var grafana_url;
var auth = {};
var body = {};


function Grafana(conf, comps) {
	grafana_url = conf.grafana.url;
	if (conf.grafana.username && conf.grafana.password) {
		auth.username = conf.grafana.username;
		auth.password = conf.grafana.password;
	} else {
		auth = null;
	}
	if (conf.grafana.debug_api === true || conf.grafana.debug_api === 'true') {
		request.debug = true;
	} else {
		request.debug = false;
	}
	components = comps;
	config = conf;
}

// creates an org
Grafana.prototype.create = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

	if (entityType === 'org') {
		body['name'] = entityValue;
		successMessage = 'Created Grafana org ' + entityValue + ' successfully.';
		failureMessage = 'Error in creating Grafana org ' + entityValue + '.';
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	var url = grafana_url + this.createURL('create', entityType, entityValue);
	sendRequest('POST', url);
	
}

// deletes a dashboard or an org
Grafana.prototype.delete = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

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
	var url = grafana_url + this.createURL('delete', entityType, entityValue);
	sendRequest('DELETE', url);

}

// shows an org or orgs or a dashboard
Grafana.prototype.show = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

	var url = grafana_url + this.createURL('show', entityType, entityValue);
	if (entityType === 'orgs') {
		successMessage = 'Showed orgs successfully.';
		failureMessage = 'Error in showing orgs.';
	} else if (entityType === 'org') {
		successMessage = 'Showed org ' + entityValue + ' successfully.';
		failureMessage = 'Error in showing org ' + entityValue + '.';
	} else if (entityType === 'dashboard') {
		successMessage = 'Showed dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in showing dashboard ' + entityValue + '.';
	}	else if (entityType === 'datasources') {
		successMessage = 'Showed datasources successfully.';
		failureMessage = 'Error in showing datasources.';
	} else if (entityType === 'datasource') {
		successMessage = 'Showed datasource ' + entityValue + ' successfully.';
		failureMessage = 'Error in showing datasource' + entityValue + '.';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	sendRequest('GET', url);

}

// imports a dashboard or all dashboards from Grafana
Grafana.prototype.import = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

	// imports a dashboard from Grafana
	if (entityType === 'dashboard') {
		successMessage = 'Dashboard '+ entityValue + ' import successful.';
		failureMessage = 'Dashboard '+ entityValue + ' import failed.';
		var url = grafana_url + this.createURL('import', entityType, entityValue);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode == 200) {
	  	  		output += body;
				components.saveDashboard(entityValue, body.dashboard, true);
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

	// import all dashboards from Grafana
	else if (entityType === 'dashboards') {
		successMessage = 'Dashboards imported successful.';
		failureMessage = 'Dashboards import failed.';
		var self = this;
		var url = grafana_url + self.createURL('list', entityType);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var dashList = [];
			if (!error && response.statusCode == 200) {
				_.each(body, function(dashboard){
					dashList.push(dashboard.uri.substring(3)); //removing db/
				});
	  	  _.each(dashList, function(dash){
	  	  	url = grafana_url + self.createURL('import', 'dashboard', dash);
	  	  	request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
						if (!error && response.statusCode == 200) {
							components.saveDashboard(dash, body.dashboard, false);
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
	}

	// imports an org from Grafana
	else if (entityType === 'org') {
		successMessage = 'Org '+ entityValue + ' import successful.';
		failureMessage = 'Org '+ entityValue + ' import failed.';
		var url = grafana_url + this.createURL('import', entityType, entityValue);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode == 200) {
	  	  output += body;
	  	  components.saveOrg(entityValue, body, true);
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

	// imports all orgs from Grafana
	else if (entityType === 'orgs') {
		successMessage = 'Orgs import successful.';
		failureMessage = 'Orgs import failed.';
		var self = this;
		var url = grafana_url + self.createURL('import', entityType);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var orgList = [];
			if (!error && response.statusCode == 200) {
				_.each(body, function(org){
					orgList.push(org.id);
				});
				_.each(orgList, function(id) {
					url = grafana_url + self.createURL('import', 'org', id);
					request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
						if (!error && response.statusCode == 200) {
							components.saveOrg(id, body, false);
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
	}

	// import a datasource from Grafana
	else if (entityType === 'datasource') {
		successMessage = 'Datasource '+ entityValue + ' import successful.';
		failureMessage = 'Datasource '+ entityValue + ' import failed.';
		var url = grafana_url + this.createURL('import', entityType, entityValue);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode == 200) {
	  	  output += body;
	  	  delete body.id;
	  	  components.saveDatasource(entityValue, body, true);
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

	// import all datasources from Grafana
	else if (entityType === 'datasources') {
		successMessage = 'Datasources import successful.';
		failureMessage = 'Datasources import failed.';
		var self = this;
		var url = grafana_url + self.createURL('import', entityType);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode == 200) {
				_.each(body, function(datasource){
					delete datasource.id;
					components.saveDatasource(datasource.name, datasource);
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
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
}

// export a dashboard to Grafana
Grafana.prototype.export = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

	var self = this;
	// exporting a dashboard to Grafana
	if (entityType === 'dashboard') {

		successMessage = 'Dashboard '+ entityValue + ' export successful.';
		failureMessage = 'Dashboard '+ entityValue + ' export failed.';

		var url_check = grafana_url + self.createURL('show', 'dashboard', entityValue);
		request.get({url: url_check, auth: auth, json: true}, function saveHandler(error_check, response_check, body_check) {
			// this means that dashboard does not exist so will create a new one
			var dashBody = {
				dashboard: components.readDashboard(entityValue),
				overwrite: true
			}
			if (response_check.statusCode === 404) {
				dashBody.dashboard.id = null;
			} else {
				dashBody.dashboard.id = body_check.dashboard.id;
			}
			body = dashBody;
			var url = grafana_url + self.createURL('export', entityType, null);
			sendRequest('POST', url);
		});

	}

  // exporting all local dashbaords to Grafana
	else if (entityType === 'dashboards') {

		var dashboards = components.readEntityNamesFromDir('dashboards');

		_.forEach(dashboards,function(dashboard){
			
			var url_check = grafana_url + self.createURL('show', 'dashboard', dashboard);
			request.get({url: url_check, auth: auth, json: true}, function saveHandler(error_check, response_check, body_check) {
				
				var dashBody = {
						dashboard: components.readDashboard(dashboard),
						overwrite: true
				}
				
				if (response_check.statusCode === 404) {
					dashBody.dashboard.id = null;
				} else {
					dashBody.dashboard.id = body_check.dashboard.id;
				}

				body = dashBody;
				var url = grafana_url + self.createURL('export', 'dashboard', dashboard);
				sendRequest('POST', url);
				successMessage = 'Dashboard '+ dashboard + ' export successful.';
				failureMessage = 'Dashboard '+ dashboard + ' export failed.';
			});
		});
	}

	// exporting a local org to Grafana
	else if (entityType === 'org') {
		body = components.readOrg(entityValue);
		successMessage = 'Org '+ entityValue + ' export successful.';
		failureMessage = 'Org '+ entityValue + ' export failed.';
		var url = grafana_url + this.createURL('export', entityType, entityValue);
		sendRequest('PUT', url);
	}

	// exporting a single local datasource to Grafana
	else if (entityType === 'datasource') {
		body = components.readDatasource(entityValue);
		var self =  this;
		successMessage = 'Datasource '+ entityValue + ' export successful.';
		failureMessage = 'Datasource '+ entityValue + ' export failed.';
		var checkDsUrl = grafana_url + this.createURL('show', entityType, entityValue);
		request.get({url: checkDsUrl, auth:auth, json:true}, function checkHandler(error_check, response_check, body_check) {
			if (response_check.statusCode === 404) {
				logger.justShow('Datasource does not exists in Grafana.');
				logger.justShow('Trying to create a new datasource.');
				delete body.id;
				var url = grafana_url + self.createURL('export', 'datasources', null);
				sendRequest('POST', url);
			} else if (response_check.statusCode === 200) {
				var url = grafana_url + self.createURL('export', entityType, body_check.id);
				sendRequest('POST', url);
			} else {
				logger.showError('Unknown response from Grafana.');
			}
		});
	}

	// exporting all local datasources to Grafana
	else if (entityType === 'datasources'){

		var self = this;

		var dsNames = components.readEntityNamesFromDir('datasources');
		var url = grafana_url + self.createURL('export', 'datasources', null)
		var failed = 0;
		var success = 0;

		request.get({url: url, auth: auth, json: true}, function saveHandler(error_check, response_check, body_check) {
			// Getting existing list of datasources and making a mapping of names to ids
			var ids = {}
			_.forEach(body_check, function(datasource) {
				ids[datasource.name] = datasource.id;
			});

			// Here we try exporting (either updating or creating) a datasource
			_.forEach(dsNames, function(ds) {
				var url;
				var method;
				body = components.readDatasource(ds);
				// if local dashboard exists in Grafana we update
				if (body.name in ids) {
					body.id = ids[body.name];
					url = grafana_url + self.createURL('export', 'datasource', body.id);
					url = addAuth(url);
					method = 'PUT';
				}
				// otherwise we create the datasource
				else {
  				delete body.id;
  				url = grafana_url + self.createURL('export', 'datasources', null);
				url = addAuth(url);
					method = 'POST';
	  		}
	  		// Use sync-request to avoid table lockdown
	  		var response = syncReq(method, url, {json: body});
	  		if (response.statusCode != 200) {
	  			logger.showOutput(response.getBody('utf8'));
	  			logger.showError('Datasource ' + ds + ' export failed.');
	  			failed++;
	  		} else {
	  			logger.showOutput(response.getBody('utf8'));
	  			logger.showResult('Datasource ' + ds + ' exported successfully.');
	  			success++;
	  		}
	  		//sendRequest(method, url); // causing table lockdown.
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

}

// list all dashboards
Grafana.prototype.list = function(commands) {

	var entityType = commands[0];

	if (entityType === 'dashboards') {
		successMessage = 'Displayed dashboards list successfully.';
		failureMessage = 'Dashboards list display failed';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	var url = grafana_url + this.createURL('list', entityType);
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

// Creates a 8 second clip of a dashboard for last 24 hours
Grafana.prototype.clip = function(commands) {

	if (!config.clip && config.clip.length < 6) {
		logger.showError('Clip configs not set. Please set all 6 clip config properties stated in README.');
		return;
	}

	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];

	localfs.createIfNotExists('temp', 'dir', false);

	if (entityType === 'dashboard') {

		var url = grafana_url + self.createURL('clip', entityType, entityValue) + 
			'?width=' + config.clip.render_width + '&height=' + config.clip.render_height + '&timeout=' +
			config.clip.render_timeout;


		url = addAuth(url);

		var now = (new Date).getTime();

		// Taking 24 screenshots
		logger.justShow('Taking 24 snapshots.');

		var i = 0;
		while(i < 24) {
			var from = now - ((i + 1) * 60 * 60000);
			var to = now - (i * 60 * 60000);
			var completeUrl = url + '&from=' + from + '&to=' + to;
			var response = syncReq('GET', completeUrl);
			var filename = 'temp/' + String.fromCharCode(120 - i) + '.png'
			localfs.writeFile(filename, response.getBody());
			i++;
			logger.showResult('Took snapshot ' + i + '.');
		}

		logger.showResult('Snapshots rendering completed.');
		logger.justShow('Waiting 5 seconds before generating clip.');
		setTimeout(self.createGif(entityValue), 5000);

	} else if (entityType === 'dashboards' && commands[1] === 'by' && commands[2] === 'tag') {
		var tag = commands[3];
		var url = grafana_url + self.createURL('search', entityType, null) + '?tag=' + tag;
		url = addAuth(url);
		var searchResponse = syncReq('GET', url);
		var responseBody = JSON.parse(searchResponse.getBody('utf8'));
		if (searchResponse.statusCode == 200 && responseBody.length > 0) {
			logger.showOutput('Taking dashboard snapshots.');
			var dashboards = _.each(responseBody, function (dashboard) {
				var dashName = dashboard.uri.substring(3);
				var dashUrl = grafana_url + self.createURL('clip', 'dashboard', dashName) + 
					'?width=' + config.clip.render_width + '&height=' + config.clip.render_height + '&timeout=' +
					config.clip.render_timeout;
				dashUrl = addAuth(dashUrl);
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
	} else {
		logger.showError('Unsupported set of commands ' + commands + '.');
	}
}

Grafana.prototype.createGif = function(clipName) {

	localfs.createIfNotExists('clips', 'dir', false);

	encoder = new GIFEncoder(config.clip.canvas_width, config.clip.canvas_height);

	pngFileStream('temp/*.png')
		.pipe(encoder.createWriteStream({ repeat: -1, delay: parseInt(config.clip.delay), quality: 40 }))
 		.pipe(localfs.writeStream('clips/' + clipName + '.gif'));

 	logger.showResult('Successfully created ' + clipName + ' clip under clips directory.');
 	logger.justShow('Please delete temp directory');
 	//localfs.deleteDirRecursive('temp');

}

// Create url for calling Grafana API
Grafana.prototype.createURL = function(command, entityType, entityValue) {

	var url = '';

	// Editing URL depending on entityType
	if (entityType === 'org') {
		url += '/api/orgs'
		if (command === 'show' || command === 'delete' || command === 'import' || command === 'export') {
			 url += '/' + entityValue;
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

}

// Sends an HTTP API request to Grafana
function sendRequest(method, url) {
	if (method === 'POST') {
		request.post({url: url, auth: auth, json: true, body: body}, printResponse); 
	} else if (method === 'GET') {
		request.get({url: url, auth: auth, json: true, method: method}, printResponse);
	} else if (method === 'DELETE') {
		request.delete({url: url, auth: auth, json: true, method: method}, printResponse);
	} else if (method === 'PUT') {
		request.put({url: url, auth: auth, json: true, body: body}, printResponse);
	}
	
}

// prints HTTP response from Grafana
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

// add auth to sync request
function addAuth(url) {
	// If the user didn't provide auth info, simply return the URL
	if (!auth)
		return url;
	var urlParts = url.split('://');
	url = urlParts[0] + '://' + auth.username + ':' + auth.password + '@' + urlParts[1];
	return url;
}

module.exports = Grafana;
