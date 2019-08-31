const _ = require('lodash');
const request = require('request');
const Table = require('cli-table');

const ClipSrv = require('./grafana/clipSrv.js');
const ExportSrv = require('./grafana/exportSrv.js');
const formatter = require('../util/formatter');
const ImportSrv = require('./grafana/importSrv.js');
const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const logger = new Logger('grafana');
const localfs = new LocalFS();
let importSrv;
let exportSrv;
let clipSrv;

function Grafana(conf, comps) {
  if (conf && conf.grafana) {
    if (conf.context && conf.context.grafana) {
      if (conf.context.grafana in conf.grafana.envs) {
        conf.grafana = conf.grafana.envs[conf.context.grafana];
      }
    }
    if (conf.grafana.url) {
      if (conf.grafana.url.slice(-1) === '/') {
        conf.grafana.url = conf.grafana.url.slice(0, -1);
      }
      this.grafanaUrl = conf.grafana.url;
    }
    if (conf.grafana.api_key) {
      this.auth = {
        bearer: conf.grafana.api_key,
      };
    } else if (conf.grafana.username && conf.grafana.password) {
      this.auth = {
        username: conf.grafana.username,
        password: conf.grafana.password,
      };
    }
    if (conf.grafana.headers) {
      this.headers = conf.grafana.headers;
    }
    if (conf.grafana.installations) {
      this.installations = conf.grafana.installations;
    }
  }
  if (comps) {
    this.components = comps;
    importSrv = new ImportSrv(this.components);
    exportSrv = new ExportSrv(this.components);
  }
  if (conf && conf.clip) {
    this.clipConfig = conf.clip;
    clipSrv = new ClipSrv(conf.clip);
  }
}

// creates an org
Grafana.prototype.create = function(commands) {
  let successMessage;
  let failureMessage;
  const entityType = commands[0];
  const entityValue = commands[1];
  const body = {};
  if (entityType === 'org') {
    body.name = entityValue;
    successMessage = `Created Grafana org ${entityValue} successfully.`;
    failureMessage = `Error in creating Grafana org ${entityValue}.`;
  } else {
    logger.showError(`Unsupported entity type ${entityType}`);
    return;
  }
  const options = this.setURLOptions();
  options.url = this.grafanaUrl + this.createURL('create', entityType, entityValue);
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
      logger.showError(failureMessage);
    }
  });
};

// deletes a dashboard or an org
Grafana.prototype.delete = function(commands) {
  const entityType = commands[0];
  const entityValue = commands[1];
  let successMessage;
  // eslint-disable-next-line no-unused-vars
  let failureMessage;
  if (entityType === 'org') {
    successMessage = `Deleted Grafana org ${entityValue} successfully.`;
    failureMessage = `Error in deleting Grafana org ${entityValue}.`;
  } else if (entityType === 'dashboard') {
    successMessage = `Deleted Grafana dashboard ${entityValue} successfully.`;
    failureMessage = `Error in deleting Grafana dashboard ${entityValue}.`;
  } else {
    logger.showError(`Unsupported entity type ${entityType}`);
    return;
  }
  const options = this.setURLOptions();
  options.url = this.grafanaUrl + this.createURL('delete', entityType, entityValue);
  request.delete(options, printResponse);
  logger.showResult(successMessage);
};

// shows Grafana entities
Grafana.prototype.show = function(commands) {
  const entityType = commands[0];
  const entityValue = commands[1];
  const options = this.setURLOptions();
  options.url = this.grafanaUrl + this.createURL('show', entityType, entityValue);
  request.get(options, printResponse);
};

// Switches an org
Grafana.prototype.switch = function(commands) {
  const entityType = commands[0];
  const entityValue = commands[1];
  const successMessage = `Org switched to ${entityValue} successfully.`;
  const failureMessage = `Org switch to ${entityValue} failed.`;
  if (entityType !== 'org') {
    logger.showError(`Unsupported entity type ${entityType}`);
    return;
  }
  const options = this.setURLOptions();
  options.url = this.grafanaUrl + this.createURL('switch', entityType, entityValue);
  request.post(options, (error, response, body) => {
    if (error) {
      logger.showOutput(error);
      logger.showError(failureMessage);
    } else {
      if (body !== undefined) {
        logger.showOutput(logger.stringify(body));
      }
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
  const entityType = commands[0];
  const entityValue = commands[1];

  if (entityType === 'dashboard') {
    importSrv.dashboard(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'dashboards') {
    importSrv.dashboards(this.grafanaUrl, this.setURLOptions());
  } else if (entityType === 'org') {
    importSrv.org(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'orgs') {
    importSrv.orgs(this.grafanaUrl, this.setURLOptions());
  } else if (entityType === 'alert') {
    importSrv.alert(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'alerts') {
    importSrv.alerts(this.grafanaUrl, this.setURLOptions());
  } else if (entityType === 'datasource') {
    importSrv.datasource(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'datasources') {
    importSrv.datasources(this.grafanaUrl, this.setURLOptions());
  } else {
    logger.showError(`Unsupported entity type ${entityType}`);
  }
};

// export a dashboard to Grafana
Grafana.prototype.export = function(commands) {
  const entityType = commands[0];
  const entityValue = commands[1];

  if (entityType === 'dashboard') {
    exportSrv.dashboard(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'dashboards') {
    exportSrv.dashboards(this.grafanaUrl, this.setURLOptions());
  } else if (entityType === 'org') {
    exportSrv.org(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'orgs') {
    exportSrv.orgs(this.grafanaUrl, this.setURLOptions());
  } else if (entityType === 'alert') {
    exportSrv.alert(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'alerts') {
    exportSrv.alerts(this.grafanaUrl, this.setURLOptions());
  } else if (entityType === 'datasource') {
    exportSrv.datasource(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'datasources') {
    exportSrv.datasources(this.grafanaUrl, this.setURLOptions());
  } else {
    logger.showError(`Unsupported entity type ${entityType}`);
  }
};

// list all dashboards
Grafana.prototype.list = function(commands) {
  let successMessage;
  let failureMessage;
  const entityType = commands[0];
  const options = this.setURLOptions();
  if (entityType === 'dashboards') {
    successMessage = 'Displayed dashboards list successfully.';
    failureMessage = 'Dashboards list display failed';
    options.url = this.grafanaUrl + this.createURL('list', entityType);
    request.get(options, (error, response, body) => {
      let output = '';
      if (!error && response.statusCode === 200) {
        const table = new Table({
          head: ['Title', 'Slug', 'ID / UID', 'Type', 'folderTitle'],
          colWidths: [30, 30, 30, 30, 30],
        });
        _.each(body, (dashboard) => {
          table.push([dashboard.title,
            dashboard.uri.substring(3),
            `${dashboard.id} / ${dashboard.uid}`,
            dashboard.type,
            dashboard.folderTitle || '']); // removing db/
        });
        output += table.toString();
        logger.showOutput(output);
        logger.showResult(`Total dashboards: ${body.length}`);
        logger.showResult(successMessage);
      } else {
        output += formatter.formatError(error, response);
        logger.showOutput(output);
        logger.showError(failureMessage);
      }
    });
  } else if (entityType === 'dash-tags') {
    successMessage = 'Displayed dashboard tags list successfully.';
    failureMessage = 'Dashboard tags list display failed';
    options.url = this.grafanaUrl + this.createURL('list', entityType);
    request.get(options, (error, response, body) => {
      let output = '';
      if (!error && response.statusCode === 200) {
        const table = new Table({
          head: ['Tag', 'Count'],
          colWidths: [50, 50],
        });
        _.each(body, (tag) => {
          table.push([tag.term, tag.count]);
        });
        output += table.toString();
        logger.showOutput(output);
        logger.showResult(`Total dashboard tags: ${body.length}`);
        logger.showResult(successMessage);
      } else {
        output += formatter.formatError(error, response);
        logger.showOutput(output);
        logger.showError(failureMessage);
      }
    });
  } else {
    logger.showError(`Unsupported entity type ${entityType}`);
  }
};

// Creates a 8 second clip of a dashboard for last 24 hours
Grafana.prototype.clip = function(commands) {
  if (!this.clipConfig || this.clipConfig.length < 6) {
    logger.showError('Clip configs not set. Please set all 6 clip config properties stated in README.');
    return;
  }
  const entityType = commands[0];
  const entityValue = commands[1];
  localfs.createDirIfNotExists('temp', true);
  // creating a gif of a dashboard
  if (entityType === 'dashboard') {
    clipSrv.dashboard(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'dashboards-by-tag') {
    clipSrv.dashboardByTag(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else if (entityType === 'dash-list') {
    clipSrv.dashList(this.grafanaUrl, this.setURLOptions(), entityValue);
  } else {
    logger.showError(`Unsupported set of commands ${commands}.`);
  }
};

// Create url for calling Grafana API
Grafana.prototype.createURL = function(command, entityType, entityValue) {
  let url = '';

  // Editing URL depending on entityType
  if (entityType === 'org') {
    if (command === 'switch') {
      url += `/api/user/using/${entityValue}`;
    } else {
      url += '/api/orgs';
      if (command === 'show' || command === 'delete' || command === 'import' || command === 'export') {
        url += `/${entityValue}`;
      }
    }
  } else if (entityType === 'orgs') {
    url += '/api/orgs';
  } else if (entityType === 'dashboard') {
    if (command === 'clip') {
      url += `/render/dashboard/db/${entityValue}`;
    } else {
      url += '/api/dashboards/db';
    }
    if (command === 'import' || command === 'delete' || command === 'show') {
      url += `/${entityValue}`;
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
      url += `/api/datasources/name/${entityValue}`;
    } else if (command === 'export') {
      url += `/api/datasources/${entityValue}`;
    }
  }
  return url;
};

// add options to request
Grafana.prototype.setURLOptions = function() {
  const options = {};
  if (this.auth) {
    options.auth = this.auth;
  }
  if (this.headers) {
    options.headers = this.headers;
  }
  options.json = true;
  return options;
};

// prints HTTP response from Grafana
function printResponse(error, response, body) {
  let output = '';
  if (!error && response.statusCode === 200) {
    output += logger.stringify(body);
    logger.showOutput(output);
  } else {
    output += formatter.formatError(error, response);
    logger.showOutput(output);
  }
}

module.exports = Grafana;
