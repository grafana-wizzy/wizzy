const _ = require('lodash');

const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const localfs = new LocalFS();
const logger = new Logger('Config');
const confDir = 'conf';
const dashListFile = 'conf/dash-list.json';

function DashList() {
}

DashList.prototype.createIfNotExists = function(showResult) {
  localfs.createDirIfNotExists(confDir, showResult);
  const dashListConfigExists = localfs.checkExists(dashListFile, 'dash-list conf file', showResult);
  if (dashListConfigExists) {
    logger.showResult('dash-list conf file already exists.');
  } else {
    this.saveDashListConf(showResult);
    logger.showResult('dash-list conf file created.');
  }
};

DashList.prototype.createList = function(commands) {
  const listName = commands[0];
  this.createIfNotExists(false);
  this.dashlistConf.use('file', { file: dashListFile });
  if (!this.dashlistConf.get('dashlists')) {
    this.dashlistConf.set('dashlists', []);
    this.saveDashListConf(false);
  }
  if (_.includes(this.getListNames(), listName)) {
    logger.showOutput(`Dashboard list ${listName} already exists. Please choose another name.`);
  } else {
    const lists = this.dashlistConf.get('dashlists');
    lists.push({ name: listName, dashboards: [] });
    this.dashlistConf.set('dashlists', lists);
    this.saveDashListConf(false);
    logger.showResult(`Dashboard list ${listName} created successfully.`);
  }
};

DashList.prototype.addDashboard = function(commands) {
  const listName = commands[0];
  const dashboardName = commands[1];
  this.dashlistConf.use('file', { file: dashListFile });
  const lists = this.dashlistConf.get('dashlists');
  const listIndex = getListIndex(listName, lists);
  if (listIndex === -1) {
    logger.showError(`Dashboard list ${listName} does not exist. Please create a dashboard list first.`);
  } else {
    lists[listIndex].dashboards.push(dashboardName);
    this.dashlistConf.set('dashlists', lists);
    this.saveDashListConf(false);
    logger.showResult(`Dashboard ${dashboardName} added to Dashboard list ${listName} successfully.`);
  }
};

DashList.prototype.removeDashboard = function(commands) {
  const listName = commands[0];
  const dashboardName = commands[1];
  this.dashlistConf.use('file', { file: dashListFile });
  const lists = this.dashlistConf.get('dashlists');
  const listIndex = getListIndex(listName, lists);
  if (listIndex === -1) {
    logger.showError(`Dashboard list ${listName} does not exist. Please create a dashboard list first.`);
  } else {
    _.pull(lists[listIndex].dashboards, dashboardName);
    this.dashlistConf.set('dashlists', lists);
    this.saveDashListConf(false);
    logger.showResult(`Dashboard ${dashboardName} deleted from Dashboard list ${listName} successfully.`);
  }
};


DashList.prototype.showList = function(commands) {
  const listName = commands[0];
  this.dashlistConf.use('file', { file: dashListFile });
  const lists = this.dashlistConf.get('dashlists');
  const listIndex = getListIndex(listName, lists);
  if (listIndex === -1) {
    logger.showError(`Dashboard list ${listName} does not exist. Please create a dashboard list first.`);
  } else {
    logger.showOutput(logger.stringify(lists[listIndex]));
    logger.showResult(`Dashboard list ${listName} displayed successfully.`);
  }
};

DashList.prototype.clearList = function(commands) {
  const listName = commands[0];
  this.dashlistConf.use('file', { file: dashListFile });
  const lists = this.dashlistConf.get('dashlists');
  const listIndex = getListIndex(listName, lists);
  if (listIndex === -1) {
    logger.showError(`Dashboard list ${listName} does not exist. Please create a dashboard list first.`);
  } else {
    lists[listIndex].dashboards = [];
    this.dashlistConf.set('dashlists', lists);
    this.saveDashListConf(false);
    logger.showResult(`Dashboard list ${listName} cleared successfully.`);
  }
};

DashList.prototype.deleteList = function(commands) {
  const listName = commands[0];
  this.dashlistConf.use('file', { file: dashListFile });
  const lists = this.dashlistConf.get('dashlists');
  const listIndex = getListIndex(listName, lists);
  if (listIndex === -1) {
    logger.showError(`Dashboard list ${listName} does not exist. Please create a dashboard list first.`);
  } else {
    lists.splice(listIndex, 1);
    this.dashlistConf.set('dashlists', lists);
    this.saveDashListConf(false);
    logger.showResult(`Dashboard list ${listName} deleted successfully.`);
  }
};

DashList.prototype.getList = function(listName) {
  this.dashlistConf.use('file', { file: dashListFile });
  const lists = this.dashlistConf.get('dashlists');
  const listIndex = getListIndex(listName, lists);
  if (listIndex === -1) {
    return [];
  }
  return lists[listIndex].dashboards;
};

function getListIndex(listName, lists) {
  return _.findIndex(lists, (list) => {
    if (list && list.name === listName) {
      return true;
    }
    return false;
  });
}

DashList.prototype.getListNames = function() {
  this.dashlistConf.use('file', { file: dashListFile });
  const lists = this.dashlistConf.get('dashlists');
  if (lists && lists.length > 0) {
    return _.map(lists, (list) => list.name);
  }
  return [];
};

// Save dashlist config
DashList.prototype.saveDashListConf = function(showOutput) {
  this.dashlistConf.use('file', { file: dashListFile });
  this.dashlistConf.save((err) => {
    if (err) {
      if (showOutput) {
        logger.showError('Error in saving dash-list config.');
      }
    } else if (showOutput) {
      logger.showResult('dash-list configuration saved.');
    }
  });
};

module.exports = DashList;
