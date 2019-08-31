const _ = require('lodash');
const Table = require('cli-table');

const LocalFS = require('../util/localfs.js');
const Logger = require('../util/logger.js');

const localfs = new LocalFS();
const logger = new Logger('datasources');
const datasrcDir = 'datasources';

function Datasources() {}

// summarize the datasources
Datasources.prototype.summarize = function() {
  const table = new Table({
    head: ['Datasource Name', 'Datasource Type'],
    colWidths: [30, 30],
  });

  const dsFiles = localfs.readFilesFromDir(datasrcDir);

  _.each(dsFiles, (dsFile) => {
    const ds = this.readDatasource(localfs.getFileName(dsFile));
    table.push([ds.name, ds.type]);
  });

  logger.showOutput(table.toString());
  logger.showResult(`Total datasources: ${dsFiles.length}`);
};

// Saves a datasource file under datasources directory on disk
Datasources.prototype.saveDatasource = function(id, datasource, showResult) {
  localfs.createDirIfNotExists(datasrcDir, showResult);
  localfs.writeFile(getDatasourceFile(id), logger.stringify(datasource, null, 2));
  if (showResult) {
    logger.showResult(`Datasource ${id} saved successfully under datasources directory.`);
  }
};

// reads datasource json from file.
// eslint-disable-next-line consistent-return
Datasources.prototype.readDatasource = function(id) {
  if (localfs.checkExists(getDatasourceFile(id))) {
    return JSON.parse(localfs.readFile(getDatasourceFile(id)));
  }

  logger.showError(`Datasource file ${getDatasourceFile(id)} does not exist.`);
  process.exit();
};

// get a datasource file name
function getDatasourceFile(id) {
  return `${datasrcDir}/${id}.json`;
}

module.exports = Datasources;
