const _ = require('lodash');

const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const DashTags = require('../local/dash-tags.js');
const TempVars = require('../local/temp-vars.js');
const Panels = require('../local/panels.js');
const Rows = require('../local/rows.js');

const localfs = new LocalFS();
const logger = new Logger('dashboards');
const dashDir = 'dashboards';

function Dashboards() {
	this.schemaVersion = 0;
  this.rows = new Rows();
  this.panels = new Panels();
  this.tempVars = new TempVars();
  this.dashTags = new DashTags();
}

// summarize dashboard
Dashboards.prototype.summarize = function(dashboardSlug) {
  let folder = '';
  if (dashboardSlug.includes('/')) {
    [folder, dashboardSlug] = dashboardSlug.split('/');
  }

  const dashboard = this.readDashboard(dashboardSlug, folder);
  const arch = {};

  // Extracting row information
  arch.title = dashboard.title;
  arch.schemaVersion = dashboard.SchemaVersion;

  if (dashboard.schemaVersion < 16) {
    arch.rowCount = _.size(dashboard.rows);
    arch.rows = [];
    _.forEach(dashboard.rows, (row) => {
      const panelInfo = _.map(row.panels, (panel) => {
        if (panel.datasource === null) {
          return `${panel.title}(default)`;
        }
        return `${panel.title}(${panel.datasource})`;
      });

      arch.rows.push({
        title: row.title,
        panelCount: _.size(row.panels),
        panels: _.join(panelInfo, ', '),
      });
    });
  } else {
    // summarize about GridLayout instead of rows
    let getMaxPos = function(panels, f) {
      return _.max(_.map(dashboard.panels,
        (panel) => f(panel.gridPos)));
    };
    arch.gridSize = {
      x: getMaxPos(dashboard.panels, (pos) => pos.x + pos.w),
      y: getMaxPos(dashboard.panels, (pos) => pos.y + pos.h)
    };
    arch.panelCount = _.size(dashboard.panels);
  }
  if ('templating' in dashboard && dashboard.templating.list.length > 0) {
    arch.templateVariableCount = _.size(dashboard.templating.list);
    arch.templateValiableNames = _.join(_.map(dashboard.templating.list, 'name'), ', ');
  }
  if ('tags' in dashboard && dashboard.tags.length > 0) {
    arch.tagCount = _.size(dashboard.tags);
    arch.tags = _.join(dashboard.tags);
  }
  arch.time = dashboard.time;
  arch.time.timezone = dashboard.timezone;
  logger.showOutput(logger.stringify(arch));
};


// Saving a dashboard file on disk
Dashboards.prototype.saveDashboard = function(slug, dashboard, meta, showResult) {
  delete dashboard.id;
  let folder = meta.folderTitle || '';
  if (folder.length > 0) {
    folder = `/${folder}`;
  }
  localfs.createDirIfNotExists(dashDir, showResult);
  localfs.createDirIfNotExists(dashDir + folder, showResult);

  // we delete version when we import the dashboard... as version is maintained by Grafana
  delete dashboard.version;
  localfs.writeFile(getDashboardFile(slug, folder), logger.stringify(dashboard, null, 2));
  if (showResult) {
    logger.showResult(`${slug} dashboard saved successfully under dashboards directory.`);
  }
};

Dashboards.prototype.insert = function(type, entity, destination) {
  const destArray = destination.split('.');
  const destDashboardSlug = destArray[0];
  const destDashboard = this.readDashboard(destDashboardSlug);

  if (type === 'temp-var') {
    const destTempVarList = destDashboard.templating.list;
    destTempVarList.push(this.tempVars.readTemplateVar(entity));
    this.saveDashboard(destDashboardSlug, destDashboard, true);
    logger.showResult(`Template variable ${entity} inserted successfully.`);
  } else if (type === 'dash-tags') {
    destDashboard.tags = destDashboard.tags.concat(this.dashTags.readDashTags(entity));
    this.saveDashboard(destDashboardSlug, destDashboard, true);
    logger.showResult(`Dashboard tags ${entity}inserted successfully.`);
  } else if (type === 'row') {
    const destRows = destDashboard.rows;
    destRows.push(this.rows.readRow(entity));
    this.saveDashboard(destDashboardSlug, destDashboard, true);
    logger.showResult(`Row ${entity} inserted successfully.`);
  } else if (type === 'panel') {
    const destRowNumber = parseInt(destArray[1]);
    const destRow = destDashboard.rows[destRowNumber - 1];
    destRow.panels.push(this.panels.readPanel(entity));
    this.saveDashboard(destDashboardSlug, destDashboard, true);
    logger.showResult(`Panel ${entity} inserted successfully.`);
  }
};

Dashboards.prototype.extract = function(type, entity, entityName, dashboard) {
  const srcDashboard = this.readDashboard(dashboard);
  let srcRows;

  if (type === 'temp-var') {
    const srcTempVarList = srcDashboard.templating.list;
    const srcTempVarNumber = parseInt(entity);
    const srcTempVar = srcTempVarList[srcTempVarNumber - 1];
    this.tempVars.saveTemplateVar(entityName, srcTempVar, true);
    logger.showResult(`Template variable ${entity} extracted successfully.`);
  } else if (type === 'dash-tags') {
    const srcDashTagsList = srcDashboard.tags;
    this.dashTags.saveDashTags(entityName, srcDashTagsList, true);
    logger.showResult('Dashboard Tags extracted successfully.');
  } else if (type === 'row') {
    srcRows = srcDashboard.rows;
    const srcRowNumber = parseInt(entity);
    const srcRow = srcRows[srcRowNumber - 1];
    this.rows.saveRow(entityName, srcRow, true);
    logger.showResult(`Row ${entity} extracted successfully.`);
  } else if (type === 'panel') {
    const srcEntity = entity.split('.');
    srcRows = srcDashboard.rows;
    const srcPanels = srcRows[srcEntity[0] - 1].panels;
    const srcPanelNumber = parseInt(srcEntity[1]);
    const srcPanel = srcPanels[srcPanelNumber - 1];
    this.panels.savePanel(entityName, srcPanel, true);
    logger.showResult(`Panel ${entity} extracted successfully.`);
  }
};

Dashboards.prototype.change = function(entityValue, oldDatasource, newDatasource) {
  const dashboard = this.readDashboard(entityValue);
  _.forEach(dashboard.rows, (row) => {
    _.forEach(row.panels, (panel) => {
      if (panel.datasource === oldDatasource) {
        panel.datasource = newDatasource;
      }
    });
  });
  this.saveDashboard(entityValue, dashboard, true);
};

Dashboards.prototype.list = function(entityValue, datasource) {
  const dashboard = this.readDashboard(entityValue);
  let panelCount = 0;
  let output = 'Panels:';
  _.forEach(dashboard.rows, (row) => {
    _.forEach(row.panels, (panel) => {
      if (panel.datasource === datasource) {
        output += `\n ${panel.title}`;
        panelCount++;
      }
    });
  });
  logger.showOutput(output);
  logger.showResult(`Total panels with datasource ${datasource}: ${panelCount}`);
};

// Reads dashboard json from file.
// eslint-disable-next-line consistent-return
Dashboards.prototype.readDashboard = function(slug, folder) {
  if (localfs.checkExists(getDashboardFile(slug, folder))) {
    let dashboard = JSON.parse(localfs.readFile(getDashboardFile(slug, folder)));
    if (dashboard.schemaVersion < 16) {
      // this dashboard is from non-GridLayout era
      return sanitizePanels(dashboard);
    } else {
      return dashboard;
    }
  }

  logger.showError(`Dashboard file ${getDashboardFile(slug, folder)} does not exist.`);
  process.exit();
};

function sanitizePanels(dashboard) {
  let panelId = 1;
  _.forEach(dashboard.rows, (row) => {
    _.forEach(row.panels, (panel) => {
      panel.id = panelId;
      panelId++;
    });
  });

  return dashboard;
}

// Get dashboard file name from slug
function getDashboardFile(slug, folder) {
  return `${dashDir}/${folder}/${slug}.json`;
}

module.exports = Dashboards;
