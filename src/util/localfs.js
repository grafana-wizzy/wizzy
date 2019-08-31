const _ = require('lodash');
const fs = require('fs');

const Logger = require('./logger.js');

const logger = new Logger('localfs');

function LocalFS() {}

// Creates a directory if it does not exists
LocalFS.prototype.createDirIfNotExists = function(name, showResult) {
  if (!fs.existsSync(name)) {
    fs.mkdirSync(name);
    if (showResult) {
      logger.showResult(`${name} directory created.`);
    }
  } else if (showResult) {
    logger.showResult(`${name} directory already exists.`);
  }
};

// Checks if a file or a dir exists
LocalFS.prototype.checkExists = function(name, output, showOutput) {
  if (fs.existsSync(name)) {
    if (showOutput) {
      logger.showResult(`${output} exists.`);
    }
    return true;
  }
  if (showOutput) {
    logger.justShow(`${output} does not exists.`);
  }
  return false;
};

LocalFS.prototype.readFile = function(name, _showOnError) {
  return fs.readFileSync(name, 'utf8', (error, _data) => {
    if (!error) {
      logger.showResult(`Read file ${name} successfully.`);
    } else {
      logger.showError(`Error in reading file ${name}`);
    }
  });
};

LocalFS.prototype.writeFile = function(name, content) {
  fs.writeFileSync(name, content);
};

LocalFS.prototype.readFilesFromDir = function(dirName) {
  return fs.readdirSync(dirName);
};

LocalFS.prototype.getDirListInside = function(path) {
  return fs.readdirSync(path).filter((file) => fs.statSync(`${path}/${file}`).isDirectory());
};

LocalFS.prototype.createDir = function(name, output) {
  fs.mkdirSync(name);
  if (output) {
    logger.showResult(`${output} created.`);
  }
};

LocalFS.prototype.deleteDir = function(name, output) {
  fs.rmdir(name);
  if (output) {
    logger.showResult(`${output} deleted.`);
  }
};

LocalFS.prototype.deleteDirRecursive = function(name, _output) {
  const files = this.readFilesFromDir(name);
  _.each(files, (file) => {
    logger.justShow(`${name}/${file}`);
    fs.unlinkSync(`${name}/${file}`);
  });
  this.deleteDir(name);
};

LocalFS.prototype.writeStream = function(name) {
  return fs.createWriteStream(name);
};

LocalFS.prototype.getFileName = function(fileNameWithExtension) {
  return fileNameWithExtension.replace(/\.[^/.]+$/, '');
};

module.exports = LocalFS;
