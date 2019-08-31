const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const localfs = new LocalFS();
const logger = new Logger('temp-vars');
const tempVarsDir = 'temp-vars';

function TempVars() {}

// Save a template variable under temp-vars directory on disk
TempVars.prototype.saveTemplateVar = function(varName, content, showResult) {
  localfs.createDirIfNotExists(tempVarsDir, showResult);
  localfs.writeFile(getTempVarFile(varName), logger.stringify(content, null, 2));
  if (showResult) {
    logger.showResult(`Template variable ${varName} saved successfully under temp-vars directory.`);
  }
};

// Reads template variable json from file.
// eslint-disable-next-line consistent-return
TempVars.prototype.readTemplateVar = function(varName) {
  if (localfs.checkExists(getTempVarFile(varName))) {
    return JSON.parse(localfs.readFile(getTempVarFile(varName)));
  }

  logger.showError(`Template variable file ${getTempVarFile(varName)} does not exist.`);
  process.exit();
};

// Get temp-var file name from var name
function getTempVarFile(varName) {
  return `${tempVarsDir}/${varName}.json`;
}

module.exports = TempVars;
