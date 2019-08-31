const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const localfs = new LocalFS();
const logger = new Logger('dash-tags');
const dashTagsDir = 'dash-tags';

function DashTags() {}

// Save dashboard tags under dash-tags directory on disk
DashTags.prototype.saveDashTags = function(varName, content, showResult) {
  localfs.createDirIfNotExists(dashTagsDir, showResult);
  localfs.writeFile(getDashTagsFile(varName), logger.stringify(content, null, 2));
  if (showResult) {
    logger.showResult(`Dashboard tags ${varName} saved successfully under dash-tags directory.`);
  }
};

// Reads dashboard tags json from file.
// eslint-disable-next-line consistent-return
DashTags.prototype.readDashTags = function(varName) {
  if (localfs.checkExists(getDashTagsFile(varName))) {
    return JSON.parse(localfs.readFile(getDashTagsFile(varName)));
  }

  logger.showError(`Dashboard tags variable file ${getDashTagsFile(varName)} does not exist.`);
  process.exit();
};

// Get dash-tags file name from var name
function getDashTagsFile(varName) {
  return `${dashTagsDir}/${varName}.json`;
}

module.exports = DashTags;
