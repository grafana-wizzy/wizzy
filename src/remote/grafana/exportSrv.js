const _ = require('lodash');

const authentication = require('../../util/authentication');
const formatter = require('../../util/formatter');
const Logger = require('../../util/logger');
const request = require('../../util/request');

const logger = new Logger('exportSrv');
let components;

function ExportSrv(comps) {
  components = comps;
}
ExportSrv.prototype.alert = function(grafanaURL, options, name) {
  const body = components.alerts.read(name);
  const successMessage = `Alert ${name} export successful.`;
  const failureMessage = `Alert ${name} export failed.`;
  options.url = createURL(grafanaURL, 'show-alert', name);
  request.get(options, (errorCheck, responseCheck, bodyCheck) => {
    if (responseCheck.statusCode === 404) {
      logger.justShow('Alert does not exists in Grafana.');
      logger.justShow('Trying to create a new alert.');
      delete body.id;
      options.url = createURL(grafanaURL, 'alerts');
      options.body = body;
      request.post(options, (error, response, body) => {
        let output = '';
        if (!error && response.statusCode === 200) {
          output += logger.stringify(body);
          logger.showOutput(output);
          logger.showResult(successMessage);
        } else {
          output += formatter.formatError(error, response);
          logger.showOutput(output);
          logger.showResult(failureMessage);
        }
      });
    } else if (responseCheck.statusCode === 200) {
      options.url = createURL(grafanaURL, 'alert', bodyCheck.id);
      options.body = body;
      request.put(options, (error, response, body) => {
        let output = '';
        if (!error && response.statusCode === 200) {
          output += logger.stringify(body);
          logger.showOutput(output);
          logger.showResult(successMessage);
        } else {
          output += formatter.formatError(error, response);
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
  const names = components.readEntityNamesFromDir('alerts');
  options.url = createURL(grafanaURL, 'alerts');
  let failed = 0;
  let success = 0;
  request.get(options, (errorCheck, responseCheck, bodyCheck) => {
    // Getting existing list of alerts and making a mapping of names to ids
    const ids = {};
    _.forEach(bodyCheck, (alert) => {
      ids[alert.name] = alert.id;
    });

    // Here we try exporting (either updating or creating) a alert
    _.forEach(names, (name) => {
      let baseUrl;
      let method;
      const body = components.alerts.read(name);
      // if local dashboard exists in Grafana we update
      if (body.name in ids) {
        body.id = ids[body.name];
        baseUrl = createURL(grafanaURL, 'alert', body.id);
        method = 'PUT';
      } else { // otherwise we create the alert
        delete body.id;
        baseUrl = createURL(grafanaURL, 'alerts');
        method = 'POST';
      }
      // Use sync-request to avoid table lockdown
      const { url, headers } = authentication.add(baseUrl, options);
      const response = request.reqSync(method, url, {
        json: body,
        headers,
      });
      if (response.statusCode !== 200) {
        logger.showOutput(response.getBody('utf8'));
        logger.showError(`Alert ${name} export failed.`);
        failed++;
      } else {
        logger.showOutput(response.getBody('utf8'));
        logger.showResult(`Alert ${name} exported successfully.`);
        success++;
      }
    });
    if (success > 0) {
      logger.showResult(`${success} alerts exported successfully.`);
    }
    if (failed > 0) {
      logger.showError(`${failed} alerts export failed.`);
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
};

ExportSrv.prototype.dashboard = function(grafanaURL, options, dashboardName) {
  let folder = '';
  if (dashboardName.includes('/')) {
    [folder, dashboardName] = dashboardName.split('/');
  }

  const successMessage = `Dashboard ${dashboardName} export successful.`;
  const failureMessage = `Dashboard ${dashboardName} export failed.`;
  options.url = createURL(grafanaURL, 'dashboard', dashboardName);
  request.get(options, (errorCheck, responseCheck, bodyCheck) => {
    // this means that dashboard does not exist so will create a new one
    const dashBody = {
      dashboard: components.dashboards.readDashboard(dashboardName, folder),
      overwrite: true,
    };
    if (responseCheck.statusCode === 404) {
      logger.justShow('Dashboard does not exist. So, creating a new dashboard.');
      dashBody.dashboard.id = null;
    } else {
      dashBody.dashboard.id = bodyCheck.dashboard.id;
    }
    options.url = createURL(grafanaURL, 'dashboards', dashboardName);
    options.body = dashBody;
    request.post(options, (error, response, body) => {
      let output = '';
      if (!error && response.statusCode === 200) {
        output += logger.stringify(body);
        logger.showOutput(output);
        logger.showResult(successMessage);
      } else {
        output += formatter.formatError(error, response);
        logger.showOutput(output);
        logger.showResult(failureMessage);
      }
    });
  });
};

ExportSrv.prototype.dashboards = function(grafanaURL, options) {
  let output = '';
  let failed = 0;
  let success = 0;

  options.url = createURL(grafanaURL, 'dashboard-search');

  request.get(options, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showError('Error getting list of dashboards from Grafana');
      process.exit(1);
    }

    // Getting existing list of dashboards and making a mapping of names to ids
    const dashSlugs = {};
    _.forEach(body, (dashboard) => {
      if (dashboard.type === 'dash-db') {
        // Removing "db/" from the uri
        dashSlugs[dashboard.uri.substring(3)] = dashboard.id;
      }
    });

    const folderSlugs = {
      General: { id: null },
    };

    _.forEach(body, (entity) => {
      if (entity.type === 'dash-folder') {
        folderSlugs[entity.title] = entity;
      }
    });

    const folderList = components.getDashboardFolders('dashboards');
    _.forEach(folderList, (folder) => {
      const dashList = components.readEntityNamesFromDir(`dashboards/${folder}`);

      if (!(folder in folderSlugs)) {
        logger.justShow(`Exporting ${folder}`);
        const { url, headers } = authentication.add(createURL(grafanaURL, 'folders'), options);
        const body = {
          title: folder,
        };
        try {
          const response = request.postSync(url, { json: body, headers });
          logger.showOutput(response.getBody('utf8'));
          folderSlugs[folder] = JSON.parse(response.getBody('utf8'));
        } catch (error) {
          logger.showError(`Folder ${folder} export failed.`);
          failed += dashList.length;
          return;
        }
        logger.showResult(`Folder ${folder} exported successfully.`);
      }

      logger.justShow(`Exporting ${dashList.length} dashboards/${folder}`);

      // Here we try exporting (either updating or creating) a dashboard
      _.forEach(dashList, (dashboard) => {
        const { url, headers } = authentication.add(createURL(grafanaURL, 'dashboards'), options);
        const body = {
          dashboard: components.dashboards.readDashboard(dashboard, folder),
          folderId: folderSlugs[folder].id,
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
        try {
          const response = request.post(url, { json: body, headers });
          try {
            logger.showOutput(response.getBody('utf8'));
          } catch (error) {
            logger.showOutput(response.body.toString('utf8'));
          }
          if (response.statusCode !== 200) {
            logger.showError(`Dashboard ${dashboard} export failed.`);
            failed++;
          } else {
            logger.showResult(`Dashboard ${dashboard} exported successfully.`);
            success++;
          }
        } catch (error) {
          logger.showError(`Dashboard ${dashboard} export failed: ${error}`);
          failed++;
        }
      });

      if (success > 0) {
        logger.showResult(`${success} dashboards exported successfully.`);
      }

      if (failed > 0) {
        logger.showError(`${failed} dashboards export failed.`);
        process.exit(1);
      }
    });
  });
};

ExportSrv.prototype.org = function(grafanaURL, options, orgName) {
  const body = components.orgs.readOrg(orgName);
  const successMessage = `Org ${orgName} export successful.`;
  const failureMessage = `Org ${orgName} export failed.`;
  options.url = createURL(grafanaURL, 'org', orgName);
  options.body = body;
  request.put(options, (error, response, body) => {
    let output = '';
    if (!error && response.statusCode === 200) {
      output += logger.stringify(body);
      logger.showOutput(output);
      logger.showResult(successMessage);
    } else {
      output += formatter.formatError(error, response);
      logger.showOutput(output);
      logger.showResult(failureMessage);
    }
  });
};

ExportSrv.prototype.orgs = function(grafanaURL, options) {
  const names = components.readEntityNamesFromDir('orgs');
  options.url = createURL(grafanaURL, 'orgs');
  let failed = 0;
  let success = 0;
  request.get(options, (errorCheck, responseCheck, bodyCheck) => {
    const ids = {};
    _.forEach(bodyCheck, (org) => {
      ids[org.name] = org.id;
    });

    _.forEach(names, (name) => {
      let url;
      let method;
      const body = components.orgs.readOrg(name);
      // if local dashboard exists in Grafana we update
      if (body.name in ids) {
        body.id = ids[body.name];
        url = createURL(grafanaURL, 'org', body.id);
        method = 'PUT';
      } else { // otherwise we create the datasource
        delete body.id;
        url = createURL(grafanaURL, 'orgs');
        method = 'POST';
      }
      // Use sync-request to avoid table lockdown
      url = sanitizeUrl(url, options.auth);
      const response = request.reqSync(method, url, { json: body, headers: options.headers });
      logger.showOutput(response.getBody('utf8'));
      if (response.statusCode === 200) {
        logger.showResult(`Org ${name} exported successfully.`);
        success++;
      } else {
        logger.showError(`Org ${name} export failed.`);
        failed++;
      }
    });
    if (success > 0) {
      logger.showResult(`${success} orgs exported successfully.`);
    }
    if (failed > 0) {
      logger.showError(`${failed} orgs export failed.`);
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
};

ExportSrv.prototype.datasource = function(grafanaURL, options, datasourceName) {
  const body = components.datasources.readDatasource(datasourceName);
  const successMessage = `Datasource ${datasourceName} export successful.`;
  const failureMessage = `Datasource ${datasourceName} export failed.`;
  options.url = createURL(grafanaURL, 'show-datasource', datasourceName);
  request.get(options, (errorCheck, responseCheck, bodyCheck) => {
    if (responseCheck.statusCode === 404) {
      logger.justShow('Datasource does not exists in Grafana.');
      logger.justShow('Trying to create a new datasource.');
      delete body.id;
      options.url = createURL(grafanaURL, 'datasources');
      options.body = body;
      request.post(options, (error, response, body) => {
        let output = '';
        if (!error && response.statusCode === 200) {
          output += logger.stringify(body);
          logger.showOutput(output);
          logger.showResult(successMessage);
        } else {
          output += formatter.formatError(error, response);
          logger.showOutput(output);
          logger.showResult(failureMessage);
        }
      });
    } else if (responseCheck.statusCode === 200) {
      options.url = createURL(grafanaURL, 'datasource', bodyCheck.id);
      options.body = body;
      request.put(options, (error, response, body) => {
        let output = '';
        if (!error && response.statusCode === 200) {
          output += logger.stringify(body);
          logger.showOutput(output);
          logger.showResult(successMessage);
        } else {
          output += formatter.formatError(error, response);
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
  const dsNames = components.readEntityNamesFromDir('datasources');
  options.url = createURL(grafanaURL, 'datasources');
  let failed = 0;
  let success = 0;
  request.get(options, (errorCheck, responseCheck, bodyCheck) => {
    // Getting existing list of datasources and making a mapping of names to ids
    const ids = {};
    _.forEach(bodyCheck, (datasource) => {
      ids[datasource.name] = datasource.id;
    });

    // Here we try exporting (either updating or creating) a datasource
    _.forEach(dsNames, (ds) => {
      let url;
      let method;
      const body = components.datasources.readDatasource(ds);
      // if local dashboard exists in Grafana we update
      if (body.name in ids) {
        body.id = ids[body.name];
        url = createURL(grafanaURL, 'datasource', body.id);
        method = 'PUT';
      } else { // otherwise we create the datasource
        delete body.id;
        url = createURL(grafanaURL, 'datasources');
        method = 'POST';
      }
      // Use sync-request to avoid table lockdown
      url = sanitizeUrl(url, options.auth);
      const response = request.reqSync(method, url, { json: body, headers: options.headers });
      if (response.statusCode !== 200) {
        logger.showOutput(response.getBody('utf8'));
        logger.showError(`Datasource ${ds} export failed.`);
        failed++;
      } else {
        logger.showOutput(response.getBody('utf8'));
        logger.showResult(`Datasource ${ds} exported successfully.`);
        success++;
      }
    });
    if (success > 0) {
      logger.showResult(`${success} datasources exported successfully.`);
    }
    if (failed > 0) {
      logger.showError(`${failed} datasources export failed.`);
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
};

// add auth to sync request
function sanitizeUrl(url, auth) {
  if (auth && auth.username && auth.password) {
    const urlParts = url.split('://');
    return `${urlParts[0]}://${auth.username}:${auth.password}@${urlParts[1]}`;
  }
  return url;
}

function createURL(grafanaURL, entityType, entityValue) {
  if (entityType === 'dashboard') {
    grafanaURL += `/api/dashboards/db/${entityValue}`;
  } else if (entityType === 'dashboards') {
    grafanaURL += '/api/dashboards/db/';
  } else if (entityType === 'dashboard-search') {
    grafanaURL += '/api/search';
  } else if (entityType === 'org') {
    grafanaURL += `/api/orgs/${entityValue}`;
  } else if (entityType === 'orgs') {
    grafanaURL += '/api/orgs';
  } else if (entityType === 'show-datasource') {
    grafanaURL += `/api/datasources/name/${entityValue}`;
  } else if (entityType === 'datasource') {
    grafanaURL += `/api/datasources/${entityValue}`;
  } else if (entityType === 'datasources') {
    grafanaURL += '/api/datasources';
  } else if (entityType === 'alert') {
    grafanaURL += `/api/alert-notifications/${entityValue}`;
  } else if (entityType === 'alerts') {
    grafanaURL += '/api/alert-notifications';
  } else if (entityType === 'folders') {
    grafanaURL += '/api/folders';
  }

  return grafanaURL;
}

module.exports = ExportSrv;
