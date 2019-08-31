/* eslint-disable brace-style */
const _ = require('lodash');

const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const Alerts = require('../local/alerts.js');
const Datasources = require('../local/datasources.js');
const Orgs = require('../local/orgs.js');
const Dashboards = require('../local/dashboards.js');
const Dashlist = require('../local/dashlist.js');

const localfs = new LocalFS();
const logger = new Logger('components');
let config;

function Components(conf) {
  config = conf;
  this.alerts = new Alerts();
  this.dashboards = new Dashboards();
  this.orgs = new Orgs();
  this.datasources = new Datasources();
  this.dashlist = new Dashlist();
}

Components.prototype.createIfNotExists = function(showOutput) {
  this.alerts.createIfNotExists(showOutput);
  this.dashboards.createIfNotExists(showOutput);
  this.orgs.createIfNotExists(showOutput);
  this.datasources.createIfNotExists(showOutput);
  this.dashlist.createIfNotExists(showOutput);
};

Components.prototype.checkDirsStatus = function(showOutput) {
  return this.alerts.checkDirStatus(showOutput)
    && this.dashboards.checkDirStatus(showOutput)
    && this.orgs.checkDirStatus(showOutput)
    && this.datasources.checkDirStatus(showOutput)
    && this.dashlist.checkFileStatus(showOutput);
};

// moves or copies a dashboard entity
Components.prototype.moveCopyOrRemove = function(commands) {
  const command = commands[0];
  const entityType = commands[1];
  const entityValue = commands[2];
  const destination = commands[3];
  let successMessage;
  let failureMessage;

  const srcDashboardSlug = checkOrGetContextDashboard();
  const srcDashboard = this.dashboards.readDashboard(srcDashboardSlug);
  const sourceArray = entityValue.split('.');

  let destinationArray = [];
  if (destination !== undefined) {
    destinationArray = destination.split('.');
  }
  let destDashboard;
  let destDashboardSlug;

  if (command === 'move') {
    successMessage = `Successfully moved ${entityType}.`;
    failureMessage = `Error in moving ${entityType}.`;
  } else if (command === 'copy') {
    successMessage = `Successfully copied ${entityType}.`;
    failureMessage = `Error in copying ${entityType}.`;
  } else if (command === 'remove') {
    successMessage = `Successfully removed ${entityType}.`;
    failureMessage = `Error in removing ${entityType}.`;
  }

  if (entityType === 'row' || entityType === 'panel') {
    const srcRows = srcDashboard.rows;
    const srcRowNumber = parseInt(sourceArray[0]);
    const srcRow = srcRows[srcRowNumber - 1];

    let destRows;
    let destRowNumber;

    // row operation
    if (entityType === 'row') {
      // when only remove row command is triggered
      if (destinationArray.length === 0 && command === 'remove') {
        srcRows.splice(srcRowNumber - 1, 1);
        this.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
        logger.showResult(successMessage);
      }

      // when destination is another row on the same dashboard
      else if (destinationArray.length === 1) {
        destRowNumber = parseInt(destinationArray[0]);
        if (command === 'move') {
          srcRows.splice(srcRowNumber - 1, 1);
        }
        srcRows.splice(destRowNumber - 1, 0, srcRow);
        this.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
        logger.showResult(successMessage);
      }

      // when destination is a row on another dashboard
      else if (destinationArray.length === 2) {
        destDashboardSlug = destinationArray[0];
        destDashboard = this.dashboards.readDashboard(destDashboardSlug);
        destRows = destDashboard.rows;
        destRowNumber = parseInt(destinationArray[1]);
        if (command === 'move') {
          srcRows.splice(srcRowNumber - 1, 1);
          this.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
        }
        destRows.splice(destRowNumber - 1, 0, srcRow);
        this.dashboards.saveDashboard(destDashboardSlug, destDashboard, true);
        logger.showResult(successMessage);
      }

      // something else happened
      else {
        logger.showError(failureMessage);
      }
    }

    // panel operation
    else if (entityType === 'panel') {
      const srcPanels = srcRows[srcRowNumber - 1].panels;
      const srcPanelNumber = parseInt(sourceArray[1]);
      const srcPanel = srcPanels[srcPanelNumber - 1];

      let destPanels;
      let destPanelNumber;

      // when only remove panel command is triggered
      if (destinationArray.length === 0 && command === 'remove') {
        srcPanels.splice(srcPanelNumber - 1, 1);
        this.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
        logger.showResult(successMessage);
      }

      // when destination is just a single number which makes no sense in panels
      else if (destinationArray.length === 1) {
        logger.showError(`Unsupported destination ${destinationArray}.`);
      }

      // when destination is another panel on the same dashboard
      else if (destinationArray.length === 2) {
        destRowNumber = parseInt(destinationArray[0]);
        destPanels = srcRows[destRowNumber - 1].panels;
        destPanelNumber = parseInt(destinationArray[1]);
        if (command === 'move') {
          srcPanels.splice(srcPanelNumber - 1, 1);
        }
        destPanels.splice(destPanelNumber - 1, 0, srcPanel);
        this.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
        logger.showResult(successMessage);
      } else if (destinationArray.length === 3) {
        destDashboardSlug = destinationArray[0];
        destDashboard = this.dashboards.readDashboard(destDashboardSlug);
        destRows = destDashboard.rows;
        destRowNumber = parseInt(destinationArray[1]);
        destPanels = destRows[destRowNumber - 1].panels;
        destPanelNumber = parseInt(destinationArray[2]);
        if (command === 'move') {
          srcPanels.splice(srcPanelNumber - 1, 1);
          this.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
        }
        destPanels.splice(destPanelNumber - 1, 0, srcPanel);
        this.dashboards.saveDashboard(destDashboardSlug, destDashboard, true);
        logger.showResult(successMessage);
      } else {
        logger.showError(failureMessage);
      }
    }
  }

  // template variable operation
  else if (entityType === 'temp-var') {
    const srcTempVarList = srcDashboard.templating.list;
    const srcTempVarNumber = parseInt(sourceArray[0]);
    const srcTempVar = srcTempVarList[srcTempVarNumber - 1];

    // remove operation
    if (destinationArray.length === 0 && command === 'remove') {
      srcTempVarList.splice(srcTempVarNumber - 1, 1);
      this.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
      logger.showResult(successMessage);
    }

    // invalid destinaton
    else if (destinationArray.length === 1) {
      logger.showError(failureMessage);
      logger.showError(`Unknown destination ${destinationArray}.`);
    }

    // valid destination
    else if (destinationArray.length === 2) {
      destDashboardSlug = destinationArray[0];
      destDashboard = this.dashboards.readDashboard(destDashboardSlug);
      const destTempVarList = destDashboard.templating.list;
      const destTempVarNumber = parseInt(destinationArray[1]);
      if (command === 'move') {
        srcTempVarList.splice(srcTempVarNumber - 1, 1);
        this.dashboards.saveDashboard(srcDashboardSlug, srcDashboard, true);
      }
      destTempVarList.splice(destTempVarNumber - 1, 0, srcTempVar);
      this.dashboards.saveDashboard(destDashboardSlug, destDashboard, true);
      logger.showResult(successMessage);
    } else {
      logger.showError(failureMessage);
      logger.showError(`Unknown destination ${destination}.`);
    }
  } else if (entityType === 'dash-tags') {
    const srcTagsList = srcDashboard.tags;
    // In this case entityValue is destination
    if (entityValue === undefined && command === 'copy') {
      logger.showError(failureMessage);
      logger.showError(`Unknown destination ${destinationArray}.`);
    } else {
      destDashboard = this.dashboards.readDashboard(entityValue);
      destDashboard.tags = destDashboard.tags.concat(srcTagsList);
      this.dashboards.saveDashboard(entityValue, destDashboard, true);
      logger.showResult(successMessage);
    }
  } else {
    logger.showError('Unsupported command called. Use `wizzy help` to find available commands.');
  }
};

// summarizes an entity
Components.prototype.summarize = function(commands) {
  const entityType = commands[0];
  let entityValue = commands[1];
  let successMessage;

  if (entityType === 'dashboard') {
    if (typeof entityValue !== 'string') {
      entityValue = checkOrGetContextDashboard();
    }
    successMessage = `Showed dashboard ${entityValue} summary successfully.`;
    this.dashboards.summarize(entityValue);
  } else if (entityType === 'orgs') {
    this.orgs.summarize();
    successMessage = 'Showed orgs summary successfully.';
  } else if (entityType === 'datasources') {
    this.datasources.summarize();
    successMessage = 'Showed datasources summary successfully.';
  } else if (entityType === 'alerts') {
    this.alerts.summarize();
    successMessage = 'Showed alerts summary successfully.';
  } else {
    logger.showError('Unsupported command. Please try `wizzy help`.');
    return;
  }
  logger.showResult(successMessage);
};

// Change an entity
Components.prototype.change = function(commands) {
  if (commands.length !== 4) {
    logger.showError('Incorrect arguments, please read the usage.');
    return;
  }

  const component = commands[0];
  const entityType = commands[1];
  const oldDatasource = commands[2];
  const newDatasource = commands[3];
  let successMessage;

  if (component === 'panels' && entityType === 'datasource') {
    successMessage = 'Datasource changed successfully';

    if (typeof oldDatasource !== 'string') {
      logger.showError('Old datasource value not supported or incorrect.');
      return;
    }
    if (typeof newDatasource !== 'string') {
      logger.showError('New datasource value not supported or incorrect.');
      return;
    }

    const entityValue = checkOrGetContextDashboard();

    this.dashboards.change(entityValue, oldDatasource, newDatasource);
    logger.showResult(successMessage);
  } else {
    logger.showError(`Unsupported command ${commands}. Please try \`wizzy help\`.`);
  }
};

Components.prototype.list = function(commands) {
  if (commands.length !== 3) {
    logger.showError('Incorrect arguments, please read the usage.');
    return;
  }
  const component = commands[0];
  const entityType = commands[1];
  const datasource = commands[2];
  let successMessage;
  if (component === 'panels' && entityType === 'datasource') {
    successMessage = `Panels with datasource ${datasource} listed successfully`;
    if (typeof datasource !== 'string') {
      logger.showError('Datasource value not supported or incorrect.');
      return;
    }
    const entityValue = checkOrGetContextDashboard();
    this.dashboards.list(entityValue, datasource);
    logger.showResult(successMessage);
  } else {
    logger.showError(`Unsupported command ${commands}. Please try \`wizzy help\`.`);
  }
};

// Extracts entities from dashboard json to local independent json
Components.prototype.extract = function(commands) {
  // Getting the context dashboard
  const dashboard = checkOrGetContextDashboard();
  if (commands[0] === 'temp-var' || commands[0] === 'panel' || commands[0] === 'row') {
    // Validating rows,panels and temp-vars commands
    if (typeof commands[2] !== 'string') {
      logger.showError(`Please provide a name for ${commands[0]} ${commands[1]}.`);
      return;
    }
    this.dashboards.extract(commands[0], commands[1], commands[2], dashboard);
  } else if (commands[0] === 'dash-tags') {
    // Validating dash-tags commands
    if (typeof commands[1] !== 'string') {
      logger.showError(`Please provide a name for ${commands[0]}.`);
      return;
    }
    this.dashboards.extract(commands[0], null, commands[1], dashboard);
  } else {
    logger.showError(`Unsupported entity ${commands[0]}. Please try \`wizzy help\`.`);
  }
};

// Inserts entities from local independent json to dashboard json
Components.prototype.insert = function(commands) {
  let dashboard;
  if (commands[0] === 'temp-var' || commands[0] === 'row') {
    // Getting the context dashboard
    if (typeof commands[2] === 'string') {
      dashboard = commands[2];
    } else {
      dashboard = checkOrGetContextDashboard();
    }
    this.dashboards.insert(commands[0], commands[1], dashboard);
  } else if (commands[0] === 'panel') {
    let destinationArray;
    if (typeof commands[2] === 'string') {
      destinationArray = commands[2].split('.');
      if (destinationArray.length === 1) {
        dashboard = `${checkOrGetContextDashboard()}.${commands[2]}`;
      } else {
        dashboard = commands[2];
      }
      this.dashboards.insert(commands[0], commands[1], dashboard);
    } else {
      logger.showError('Unknown destination for panel.');
    }
  } else if (commands[0] === 'dash-tags') {
    // Getting the context dashboard
    if (typeof commands[2] === 'string') {
      dashboard = commands[2];
    } else {
      dashboard = checkOrGetContextDashboard();
    }
    this.dashboards.insert(commands[0], commands[1], dashboard);
  } else {
    logger.showError(`Unsupported entity ${commands[0]}. Please try \`wizzy help\`.`);
  }
};

// Reads all entities from a directory and removes
Components.prototype.readEntityNamesFromDir = function(dirName) {
  let entities = [];
  entities = _.map(localfs.readFilesFromDir(`./${dirName}`), (fileNameWithExtension) => localfs.getFileName(fileNameWithExtension));
  return entities;
};

// Reads all entities from a directory and removes
Components.prototype.getDashboardFolders = function(dirName) {
  let entities = [];
  entities = localfs.getDirListInside(`./${dirName}`);
  return entities;
};

// Checking context dashboard setting
// eslint-disable-next-line consistent-return
function checkOrGetContextDashboard() {
  if (config.context && config.context.dashboard) {
    return config.context.dashboard;
  }
  logger.showError('Please set dashboard context using `wizzy set ...` command.');
  process.exit();
}

module.exports = Components;
