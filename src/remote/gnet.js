const _ = require('lodash');
const request = require('request');
const Table = require('cli-table');

const Logger = require('../util/logger.js');
const formatter = require('../util/formatter');

const logger = new Logger('Grafana.net');
let gnetDashboardsUrl = 'https://grafana.net/api/dashboards';

const datasourceMap = {
  promethues: 'prometheus',
  graphite: 'graphite',
  elasticsearch: 'elasticsearch',
  influxdb: 'influxdb',
  cloudwatch: 'cloudwatch',
  zabbix: 'alexanderzobnin-zabbix-datasource',
  opentsdb: 'opentsdb',
  grafana: 'grafana',
  mixed: 'mixed',
  opennms: 'opennms-datasource',
};

function GNet(comps) {
  this.components = comps;
}

// searches Grafana.net dashboards for dashboard list
GNet.prototype.list = function(commands) {
  if (commands[0] === 'dashboards') {
    const successMessage = 'Successfully searched Grafana.net.';
    const failureMessage = 'Searching Grafana.net failed.';
    gnetDashboardsUrl += '?orderBy=name';
    if (commands.length === 2) {
      const filter = commands[1].split('=');
      if (filter[0] === 'ds') {
        gnetDashboardsUrl += `&dataSourceSlugIn=${datasourceMap[filter[1].toLowerCase()]}`;
      }
    }
    request.get({ url: gnetDashboardsUrl, json: true }, (error, response, body) => {
      let output = '';
      if (!error && response.statusCode === 200) {
        const table = new Table({
          head: ['Id', 'Title', 'Datasource', 'Downloads', 'Revision'],
          colWidths: [10, 50, 20, 20, 10],
        });
        _.each(body.items, (dashboard) => {
          table.push([dashboard.id, dashboard.name, dashboard.datasource, dashboard.downloads, dashboard.revision]); // removing db/
        });
        output += table.toString();
        logger.showOutput(output);
        logger.showResult(`Total dashboards: ${body.items.length}`);
        logger.showResult(successMessage);
      } else {
        output += formatter.formatError(error, response);
        logger.showOutput(output);
        logger.showError(failureMessage);
      }
    });
  }
};

// searches Grafana.net dashboards for dashboard list
GNet.prototype.download = function(commands) {
  if (commands[0] === 'dashboard') {
    const successMessage = 'Successfully downloaded Grafana.net dashboard.';
    const failureMessage = 'Grafana.net dashboard download failed.';
    const dashId = parseInt(commands[1]);
    const revisionId = parseInt(commands[2]);
    const dashboardUrl = `${gnetDashboardsUrl}/${dashId}/revisions/${revisionId}/download`;
    request.get({ url: dashboardUrl, json: true }, (error, response, body) => {
      let output = '';
      if (!error && response.statusCode === 200) {
        this.components.dashboards.saveDashboard(convertName2Slug(body.title), body, true);
        logger.showResult(successMessage);
      } else {
        output += `Unable to get dashboard ${dashId} with ${revisionId} from Grafana.net.`;
        logger.showOutput(output);
        logger.showError(failureMessage);
      }
    });
  }
};

function convertName2Slug(name) {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '');
}

module.exports = GNet;
