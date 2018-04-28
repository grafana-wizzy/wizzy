#!/usr/bin/env node
"use strict";

var request = require('request');
var Logger = require('../../util/logger.js');
var logger = new Logger('importSrv');
var _ = require('lodash');
var syncReq = require('sync-request');
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
      components.dashboards.saveDashboard(dashboardName, body.dashboard, body.meta, true);
      logger.showResult(successMessage);
    } else {
      if (response !== null) {
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
  var output = '';
  var failed = 0;
  var success = 0;

  // Getting Dashboards and put them into folders / main

  options.url = createURL(grafanaURL, 'dashboards');
  options.json = true;

  request.get(options, function saveHandler(error, response, body) {
    if (error || response.statusCode !== 200) {
      output += 'Grafana API response status code = ' + response.statusCode;
      if (error === null) {
        output += '\nNo error body from Grafana API.';
      }
      else {
        output += '\n' + error;
      }
      logger.showOutput(output);
      logger.showError('Error getting list of dashboards from Grafana');
      process.exit(1);
    }

    var dashList = [];
    _.forEach(body, function(dashboard) {
      dashList.push(dashboard.uri.substring(3)); //removing db/
    });
    logger.justShow('Importing ' + dashList.length + ' dashboards:');

    var headers = options.headers || {};
    if (options.auth.bearer) {
      headers.Authorization = 'Bearer ' + options.auth.bearer;
    }

    // Here we try importing a dashboard
    _.forEach(dashList, function(dashboard) {
      var url = createURL(grafanaURL, 'dashboard', dashboard);
      url = sanitizeUrl(url, options.auth);
      try {
        var response = syncReq('GET', url, { headers: headers});
        if (response.statusCode !== 200) {
          logger.showError('Dashboard ' + dashboard + ' import failed: ' + response.getBody('utf8'));
          failed++;
        } else {
          var dashResponse = JSON.parse(response.getBody('utf8'));
          components.dashboards.saveDashboard(dashboard, dashResponse.dashboard, dashResponse.meta, false);
          logger.showResult('Dashboard ' + dashboard + ' imported successfully.');
          success++;
        }
      } catch (error) {
        logger.showError('Dashboard ' + dashboard + ' import failed: ' + error);
        failed++;
      }
    });

    if (success > 0) {
      logger.showResult(success + ' dashboards imported successfully.');
    }

    if (failed > 0) {
      logger.showError(failed + ' dashboards import failed.');
      process.exit(1);
    }
  });
};

ImportSrv.prototype.org = function(grafanaURL, options, orgName) {
  var successMessage = 'Org '+ orgName + ' import successful.';
  var failureMessage = 'Org '+ orgName + ' import failed.';
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
  var failureMessage = 'Orgs import failed.';
  var output = '';
  options.url = createURL(grafanaURL, 'orgs');
  options.json = true;
  request.get(options, function saveHandler(error, response, body) {
    var orgList = [];
    if (!error && response.statusCode === 200) {
      _.each(body, function(org) {
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
  var failureMessage = 'Datasources import failed.';
  var output = '';
  options.url = createURL(grafanaURL, 'datasources');
  options.json = true;
  request.get(options, function saveHandler(error, response, body) {
    if (!error && response.statusCode === 200) {
      _.each(body, function(datasource) {
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

ImportSrv.prototype.alert = function(grafanaURL, options, name) {
  options.url = createURL(grafanaURL, 'alert', name);
  options.json = true;
  request.get(options, function saveHandler(error, response, body) {
    var output = '';
    if (!error && response.statusCode === 200) {
      output += body;
      delete body.id;
      components.alerts.save(body.name, body, true);
      logger.showResult('Alert ' + name + ' import successful.');
    } else {
      output += 'Grafana API response status code = ' + response.statusCode;
      if (error === null) {
        output += '\nNo error body from Grafana API.';
      } else {
        output += '\n' + error;
      }
      logger.showOutput(output);
      logger.showError('Alert ' + name + ' import failed.');
    }
  });
};

ImportSrv.prototype.alerts = function(grafanaURL, options) {
  var self = this;
  var output = '';
  options.url = createURL(grafanaURL, 'alerts');
  options.json = true;
  request.get(options, function saveHandler(error, response, body) {
    if (!error && response.statusCode === 200) {
      _.each(body, function(alert) {
        self.alert(grafanaURL, options, alert.id);
      });
      logger.showResult('Total alerts imported: ' + body.length);
      logger.showResult('Alerts import successful.');
    } else {
      output += 'Grafana API response status code = ' + response.statusCode;
      if (error === null) {
        output += '\nNo error body from Grafana API.';
      } else {
        output += '\n' + error;
      }
      logger.showOutput(output);
      logger.showError('Alerts import failed.');
    }
  });
};

// add auth to sync request
function sanitizeUrl(url, auth) {
  if (auth && auth.username && auth.password) {
    var urlParts = url.split('://');
    return urlParts[0] + '://' + encodeURIComponent(auth.username) + ':' + encodeURIComponent(auth.password) + '@' + urlParts[1];
  } else {
    return url;
  }
}

function createURL(grafanaURL, entityType, entityValue) {
  if (entityType === 'dashboard') {
    grafanaURL += '/api/dashboards/db/' + entityValue;
  // } else if (entityType === 'dashboard-uid') {              -> For the future
  //   grafanaURL += '/api/dashboards/uid/' + entityValue;
  } else if (entityType === 'folders') {
    grafanaURL += '/api/search?type=dash-folder';
  } else if (entityType === 'dashboards') {
    grafanaURL += '/api/search?type=dash-db';
  } else if (entityType === 'org') {
    grafanaURL += '/api/orgs/' + entityValue;
  } else if (entityType === 'orgs') {
    grafanaURL += '/api/orgs';
  } else if (entityType === 'datasources') {
    grafanaURL += '/api/datasources';
  } else if (entityType === 'datasource') {
    grafanaURL += '/api/datasources/name/' + entityValue;
  } else if (entityType === 'alerts') {
    grafanaURL += '/api/alert-notifications';
  } else if (entityType === 'alert') {
    grafanaURL += '/api/alert-notifications/' + entityValue;
  }

  return grafanaURL;
}

module.exports = ImportSrv;
