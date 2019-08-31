const _ = require('lodash');
const nconf = require('nconf');

const LocalFS = require('./localfs.js');
const Logger = require('./logger.js');

const logger = new Logger('Config');
const confDir = 'conf';
const confFile = 'conf/wizzy.json';

const validConfigs = [
  'grafana:url',
  'grafana:username',
  'grafana:password',
  'grafana:debug_api',
  'grafana:headers',
  'grafana:api_key',
  'grafana:envs',
  'context:dashboard',
  'context:grafana',
  's3:bucket_name',
  's3:path',
  'clip:render_height',
  'clip:render_width',
  'clip:render_timeout',
  'clip:canvas_width',
  'clip:canvas_height',
  'clip:delay',
];

// Constructor
function Config() {
  this.localfs = new LocalFS();
}

// Initialize wizzy configuration
Config.prototype.initialize = function initialize() {
  this.localfs.createDirIfNotExists(confDir, true);
  const configExists = this.localfs.checkExists(confFile, 'conf file', false);
  if (configExists) {
    logger.showResult('conf file already exists.');
  } else {
    nconf.set('config', {});
    this.saveConfig(false);
    logger.showResult('conf file created.');
  }
  logger.showResult('wizzy successfully initialized.');
};

// Check wizzy configuration for status command
Config.prototype.statusCheck = function statusCheck(showOutput) {
  let check = true;
  check = check && this.localfs.checkExists(confDir, 'conf directory', showOutput);
  check = check && this.localfs.checkExists(confFile, 'conf file', showOutput);
  return check;
};

// Check if wizzy config dir, file and config field is initialized
Config.prototype.checkConfigPrereq = function checkConfigPrereq(showOutput) {
  const check = this.statusCheck(false);
  if (check) {
    if (showOutput) {
      logger.showResult('wizzy configuration is initialized.');
    }
    return;
  }
  logger.showError('wizzy configuration not initialized. Please run `wizzy init`.');
  process.exit();
};

// Adds a new wizzy config property
Config.prototype.addProperty = function addProperty(commands) {
  this.checkConfigPrereq();
  nconf.use('file', { file: confFile });
  let config = `${commands[0]}:${commands[1]}`;
  if (_.includes(validConfigs, config)) {
    const values = commands.splice(2);
    let value;
    if (values.length === 0) {
      logger.showError('Missing configuration property value.');
      return;
    } if (values.length === 1) {
      value = values[0];
    } else if (values.length === 2) {
      config = `${config}:${values[0]}`;
      value = values[1];
    } else if (values.length === 3) {
      config = `${config}:${values[0]}:${values[1]}`;
      value = values[2];
    } else if (values.length === 4) {
      config = `${config}:${values[0]}:${values[1]}:${values[2]}`;
      value = values[3];
    } else {
      logger.showError('Unknown configuration property or missing property value.');
      return;
    }
    nconf.set(`config:${config}`, value);
    this.saveConfig(true);
    logger.showResult(`${config} updated successfully.`);
  } else {
    logger.showError('Unknown configuration property or missing property value.');
  }
};

// Removes an existing wizzy config property
Config.prototype.removeProperty = function removeProperty(commands) {
  this.checkConfigPrereq();
  nconf.use('file', { file: confFile });
  const config = `${commands[0]}:${commands[1]}`;
  if (_.includes(validConfigs, config)) {
    let parent;
    let property;
    if (commands.length < 2) {
      logger.showError('Missing configuration property value.');
      return;
    } if (commands.length === 2) {
      parent = commands[0];
      property = commands[1];
    } else if (commands.length === 3) {
      parent = `${commands[0]}:${commands[1]}`;
      property = commands[2];
    } else if (commands.length === 4) {
      parent = `${commands[0]}:${commands[1]}:${commands[2]}`;
      property = commands[3];
    } else {
      logger.showError('Unknown configuration property or missing property value.');
      return;
    }
    if (parent === undefined) {
      logger.showError('Unknown configuration property or missing property value.');
      return;
    }
    const parentConfig = nconf.get(`config:${parent}`);
    if (!(property in parentConfig)) {
      logger.showError('Unknown configuration property or missing property value.');
      return;
    }
    delete parentConfig[property];
    nconf.set(`config:${parent}`, parentConfig);
    this.saveConfig(true);
    logger.showResult(`${property} removed successfully.`);
    logger.showResult(`${parent} updated successfully.`);
  } else {
    logger.showError('Unknown configuration property or missing property value.');
  }
};

// Shows all wizzy configuration properties
Config.prototype.showProperty = function(config) {
  this.checkConfigPrereq();
  nconf.use('file', { file: confFile });
  const value = nconf.get(config);
  if (value !== undefined) {
    logger.showOutput(logger.stringify(value));
  } else {
    logger.showError('No configuration found.');
  }
};

// Gets a config property from wizzy configuration file
Config.prototype.getProperty = function(config) {
  this.checkConfigPrereq();
  nconf.use('file', { file: confFile });
  return (nconf.get(config));
};

// Save wizzy config file
Config.prototype.saveConfig = function(showOutput) {
  nconf.use('file', { file: confFile });
  nconf.save((err) => {
    if (err) {
      if (showOutput) {
        logger.showError('Error in saving wizzy conf file.');
      }
    } else if (showOutput) {
      logger.showResult('conf file saved.');
    }
  });
};

module.exports = Config;
