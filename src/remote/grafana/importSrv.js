const _ = require('lodash');
const request = require('request');
const syncReq = require('sync-request');

const formatter = require('../../util/formatter');
const Logger = require('../../util/logger.js');

const logger = new Logger('importSrv');
let components;

function ImportSrv(comps) {
  components = comps;
}

ImportSrv.prototype.dashboard = function(grafanaURL, options, dashboardName) {
  const successMessage = `Dashboard ${dashboardName} import successful.`;
  const failureMessage = `Dashboard ${dashboardName} import failed.`;
  let output = '';
  options.url = createURL(grafanaURL, 'dashboard', dashboardName);
  options.json = true;
  request.get(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      output += body;
      components.dashboards.saveDashboard(dashboardName, body.dashboard, body.meta, true);
      logger.showResult(successMessage);
    } else {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showError(failureMessage);
    }
  });
};

ImportSrv.prototype.dashboards = function(grafanaURL, options) {
  let output = '';
  let failed = 0;
  let success = 0;

  // Getting Dashboards and put them into folders / main

  options.url = createURL(grafanaURL, 'dashboards');
  options.json = true;

  request.get(options, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showError('Error getting list of dashboards from Grafana');
      process.exit(1);
    }

    const dashList = [];
    _.forEach(body, (dashboard) => {
      dashList.push(dashboard.uri.substring(3)); // removing db/
    });
    logger.justShow(`Importing ${dashList.length} dashboards:`);

    const headers = options.headers || {};
    if (options.auth.bearer) {
      headers.Authorization = `Bearer ${options.auth.bearer}`;
    }

    // Here we try importing a dashboard
    _.forEach(dashList, (dashboard) => {
      let url = createURL(grafanaURL, 'dashboard', dashboard);
      url = sanitizeUrl(url, options.auth);
      try {
        const response = syncReq('GET', url, { headers });
        if (response.statusCode !== 200) {
          logger.showError(`Dashboard ${dashboard} import failed: ${response.getBody('utf8')}`);
          failed++;
        } else {
          const dashResponse = JSON.parse(response.getBody('utf8'));
          components.dashboards.saveDashboard(dashboard, dashResponse.dashboard, dashResponse.meta, false);
          logger.showResult(`Dashboard ${dashboard} imported successfully.`);
          success++;
        }
      } catch (error) {
        logger.showError(`Dashboard ${dashboard} import failed: ${error}`);
        failed++;
      }
    });

    if (success > 0) {
      logger.showResult(`${success} dashboards imported successfully.`);
    }

    if (failed > 0) {
      logger.showError(`${failed} dashboards import failed.`);
      process.exit(1);
    }
  });
};

ImportSrv.prototype.org = function(grafanaURL, options, orgName) {
  const successMessage = `Org ${orgName} import successful.`;
  const failureMessage = `Org ${orgName} import failed.`;
  let output = '';
  options.url = createURL(grafanaURL, 'org', orgName);
  options.json = true;
  request.get(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      output += body;
      components.orgs.saveOrg(orgName, body, true);
      logger.showResult(successMessage);
    } else {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showError(failureMessage);
    }
  });
};

ImportSrv.prototype.orgs = function(grafanaURL, options) {
  const successMessage = 'Orgs import successful.';
  const failureMessage = 'Orgs import failed.';
  let output = '';
  options.url = createURL(grafanaURL, 'orgs');
  options.json = true;
  request.get(options, (error, response, body) => {
    const orgList = [];
    if (!error && response.statusCode === 200) {
      _.each(body, (org) => {
        orgList.push(org.id);
      });
      _.each(orgList, (id) => {
        options.url = createURL(grafanaURL, 'org', id);
        request.get(options, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            components.orgs.saveOrg(id, body, false);
          }
        });
      });
      logger.showResult(`Total orgs imported: ${body.length}`);
      logger.showResult(successMessage);
    } else {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showError(failureMessage);
    }
  });
};

ImportSrv.prototype.datasource = function(grafanaURL, options, datasourceName) {
  const successMessage = `Datasource ${datasourceName} import successful.`;
  const failureMessage = `Datasource ${datasourceName} import failed.`;
  let output = '';
  options.url = createURL(grafanaURL, 'datasource', datasourceName);
  options.json = true;
  request.get(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      output += body;
      delete body.id;
      components.datasources.saveDatasource(datasourceName, body, true);
      logger.showResult(successMessage);
    } else {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showError(failureMessage);
    }
  });
};

ImportSrv.prototype.datasources = function(grafanaURL, options) {
  const successMessage = 'Datasources import successful.';
  const failureMessage = 'Datasources import failed.';
  let output = '';
  options.url = createURL(grafanaURL, 'datasources');
  options.json = true;
  request.get(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      _.each(body, (datasource) => {
        delete datasource.id;
        components.datasources.saveDatasource(datasource.name, datasource, false);
      });
      logger.showResult(`Total datasources imported: ${body.length}`);
      logger.showResult(successMessage);
    } else {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showError(failureMessage);
    }
  });
};

ImportSrv.prototype.alert = function(grafanaURL, options, name) {
  options.url = createURL(grafanaURL, 'alert', name);
  options.json = true;
  request.get(options, (error, response, body) => {
    let output = '';
    if (!error && response.statusCode === 200) {
      output += body;
      delete body.id;
      components.alerts.save(body.name, body, true);
      logger.showResult(`Alert ${name} import successful.`);
    } else {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showError(`Alert ${name} import failed.`);
    }
  });
};

ImportSrv.prototype.alerts = function(grafanaURL, options) {
  let output = '';
  options.url = createURL(grafanaURL, 'alerts');
  options.json = true;
  request.get(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      _.each(body, (alert) => {
        this.alert(grafanaURL, options, alert.id);
      });
      logger.showResult(`Total alerts imported: ${body.length}`);
      logger.showResult('Alerts import successful.');
    } else {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showError('Alerts import failed.');
    }
  });
};

// add auth to sync request
function sanitizeUrl(url, auth) {
  if (auth && auth.username && auth.password) {
    const urlParts = url.split('://');
    return `${urlParts[0]}://${encodeURIComponent(auth.username)}:${encodeURIComponent(auth.password)}@${urlParts[1]}`;
  }
  return url;
}

function createURL(grafanaURL, entityType, entityValue) {
  if (entityType === 'dashboard') {
    grafanaURL += `/api/dashboards/db/${entityValue}`;
  // } else if (entityType === 'dashboard-uid') {              -> For the future
  //   grafanaURL += '/api/dashboards/uid/' + entityValue;
  } else if (entityType === 'folders') {
    grafanaURL += '/api/search?type=dash-folder';
  } else if (entityType === 'dashboards') {
    grafanaURL += '/api/search?type=dash-db';
  } else if (entityType === 'org') {
    grafanaURL += `/api/orgs/${entityValue}`;
  } else if (entityType === 'orgs') {
    grafanaURL += '/api/orgs';
  } else if (entityType === 'datasources') {
    grafanaURL += '/api/datasources';
  } else if (entityType === 'datasource') {
    grafanaURL += `/api/datasources/name/${entityValue}`;
  } else if (entityType === 'alerts') {
    grafanaURL += '/api/alert-notifications';
  } else if (entityType === 'alert') {
    grafanaURL += `/api/alert-notifications/${entityValue}`;
  }

  return grafanaURL;
}

module.exports = ImportSrv;
