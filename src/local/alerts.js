const _ = require('lodash');
const Table = require('cli-table');

const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const localfs = new LocalFS();
const logger = new Logger('alerts');
const alertDir = 'alerts';

function Alerts() {}

// summarize the alerts
Alerts.prototype.summarize = function() {
  const table = new Table({
    head: ['Alert Name'],
    colWidths: [30],
  });

  const dsFiles = localfs.readFilesFromDir(alertDir);

  _.each(dsFiles, function(dsFile) {
    const ds = this.read(localfs.getFileName(dsFile));
    table.push([ds.name]);
  });

  logger.showOutput(table.toString());
  logger.showResult(`Total alerts: ${dsFiles.length}`);
};

// Saves a alert file under alerts directory on disk
Alerts.prototype.save = function(id, alert, showResult) {
  localfs.createDirIfNotExists(alertDir, showResult);
  localfs.writeFile(getAlertFile(id), logger.stringify(alert, null, 2));
  if (showResult) {
    logger.showResult(`Alert ${id} saved successfully under alerts directory.`);
  }
};

// reads alert json from file.
// eslint-disable-next-line consistent-return
Alerts.prototype.read = function(id) {
  if (localfs.checkExists(getAlertFile(id))) {
    return JSON.parse(localfs.readFile(getAlertFile(id)));
  }

  logger.showError(`Alert file ${getAlertFile(id)} does not exist.`);
  process.exit();
};

// get a alert file name
function getAlertFile(id) {
  return `${alertDir}/${id}.json`;
}

module.exports = Alerts;
