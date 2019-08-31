const _ = require('lodash');
const Table = require('cli-table');

const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const localfs = new LocalFS();
const logger = new Logger('orgs');
const orgsDir = 'orgs';

function Orgs() {}

// summarize the orgs
Orgs.prototype.summarize = function() {
  const table = new Table({
    head: ['Org Id', 'Org Name'],
    colWidths: [25, 25],
  });

  const orgFiles = localfs.readFilesFromDir(orgsDir);
  _.each(orgFiles, (orgFile) => {
    const org = this.readOrg(localfs.getFileName(orgFile));
    table.push([org.id, org.name]);
  });

  logger.showOutput(table.toString());
  logger.showResult(`Total orgs: ${orgFiles.length}`);
};

// Saves an org file under orgs directory on disk
Orgs.prototype.saveOrg = function(id, org, showResult) {
  localfs.createDirIfNotExists(orgsDir, showResult);
  localfs.writeFile(getOrgFile(id), logger.stringify(org, null, 2));
  if (showResult) {
    logger.showResult(`Org ${id} saved successfully under orgs directory.`);
  }
};

// Reads org json from file.
// eslint-disable-next-line consistent-return
Orgs.prototype.readOrg = function(id) {
  if (localfs.checkExists(getOrgFile(id))) {
    return JSON.parse(localfs.readFile(getOrgFile(id)));
  }

  logger.showError(`Org file ${getOrgFile(id)} does not exist.`);
  process.exit();
};

// gets org filename
function getOrgFile(id) {
  return `${orgsDir}/${id}.json`;
}

module.exports = Orgs;
