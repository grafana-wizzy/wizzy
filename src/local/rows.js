const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const localfs = new LocalFS();
const logger = new Logger('temp-vars');
const rowsDir = 'rows';

function Rows() {}

// Save a row under rows directory on disk
Rows.prototype.saveRow = function(rowName, content, showResult) {
  localfs.createDirIfNotExists(rowsDir, showResult);
  localfs.writeFile(getRowsFile(rowName), logger.stringify(content, null, 2));
  if (showResult) {
    logger.showResult(`Row ${rowName} saved successfully under rows directory.`);
  }
};

// Reads row json from file.
// eslint-disable-next-line consistent-return
Rows.prototype.readRow = function(rowName) {
  if (localfs.checkExists(getRowsFile(rowName))) {
    return JSON.parse(localfs.readFile(getRowsFile(rowName)));
  }

  logger.showError(`Row file ${getRowsFile(rowName)} does not exist.`);
  process.exit();
};

// Get row file name from var name
function getRowsFile(rowName) {
  return `${rowsDir}/${rowName}.json`;
}

module.exports = Rows;
