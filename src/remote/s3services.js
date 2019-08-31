const _ = require('lodash');
const AWS = require('aws-sdk');

const Logger = require('../util/logger.js');

const logger = new Logger();

// Create the s3 bucket and required directories
function S3(conf, comps) {
  this.params = {};
  if (conf && conf.s3 && conf.s3.bucket_name) {
    this.params.Bucket = conf.s3.bucket_name;
  }
  if (conf && conf.s3 && conf.s3.path) {
    this.params.Key = conf.s3.path;
  }
  this.components = comps;
  this.s3 = new AWS.S3({ params: { Bucket: this.params.Bucket } });
}

S3.prototype.upload = function upload(commands) {
  const entityType = commands[0];
  const entityValue = commands[1];
  let successMessage;
  let failureMessage;

  if (entityType === 'dashboard') {
    successMessage = `Dashboard ${entityValue} upload successful to AWS S3.`;
    failureMessage = `Dashboard ${entityValue} upload failed to AWS S3.`;
    const dashboardData = this.components.dashboards.readDashboard(entityValue);
    let key = '';
    if (this.params.Key) {
      key = `${this.params.Key}dashboards/${entityValue}.json`;
    } else {
      key = `dashboards/${entityValue}.json`;
    }
    this.s3.putObject({
      Key: key,
      Body: JSON.stringify(dashboardData),
    }, (err, _data) => {
      if (err) {
        logger.showError(failureMessage);
        logger.showError(`Dashboard ${entityValue} cannot be stored in location s3://${this.params.Bucket}/${key}.`);
      } else {
        logger.showResult(successMessage);
      }
    });
  } else if (entityType === 'dashboards') {
    successMessage = 'Dashboards are being uploaded. Command will exit once all dashboards are uploaded.';
    const dashboards = this.components.readEntityNamesFromDir('dashboards');
    _.forEach(dashboards, (dashboard) => {
      const dashboardData = this.components.dashboards.readDashboard(dashboard);
      let key = '';
      if (this.params.Key) {
        key = `${this.params.Key}dashboards/${dashboard}.json`;
      } else {
        key = `dashboards/${dashboard}.json`;
      }
      this.s3.putObject({
        Key: key,
        Body: JSON.stringify(dashboardData),
      }, (err, _data) => {
        if (err) {
          logger.showError(err);
          logger.showError(`Dashboard ${entityValue} cannot be stored in location s3://${this.params.Bucket}/${key}.`);
        }
      });
    });
    logger.showResult(successMessage);
  } else {
    logger.showError(`Unsupported entity type ${entityType}`);
  }
};

S3.prototype.download = function download(commands) {
  const entityType = commands[0];
  const entityValue = commands[1];
  let successMessage;
  let failureMessage;

  if (entityType === 'dashboard') {
    successMessage = `Downloaded dashboard ${entityValue} successfully.`;
    failureMessage = `Error in downloading dashboard ${entityValue}.`;
    let key = '';
    if (this.params.Key) {
      key = `${this.params.Key}dashboards/${entityValue}.json`;
    } else {
      key = `dashboards/${entityValue}.json`;
    }
    this.s3.getObject({
      Key: key,
    }, (err, data) => {
      if (err) {
        logger.showError(failureMessage);
        logger.showError(`Dashboard ${entityValue} not present in location s3://${this.params.Bucket}/${key}.`);
      } else {
        this.components.dashboards.saveDashboard(entityValue, JSON.parse(data.Body.toString()), true);
        logger.showResult(successMessage);
      }
    });
  } else if (entityType === 'dashboards') {
    successMessage = 'Dashboards are being downloaded. Command will exit once all dashboards are downloaded.';
    // eslint-disable-next-line no-unused-vars
    const dashboards = this.components.readEntityNamesFromDir('dashboards');
    let bucketKey = '';
    if (this.params.Key) {
      bucketKey = `${this.params.Key}dashboards/`;
    } else {
      bucketKey = 'dashboards/';
    }
    delete this.params.Key;
    this.s3.listObjects(this.params, (err, data) => {
      if (err) {
        logger.showError(err);
        return;
      }

      const dashboards = data.Contents;
      _.forEach(dashboards, (dashboard) => {
        if (dashboard.Key.indexOf(bucketKey) > -1) {
          const key = dashboard.Key;
          this.s3.getObject({
            Bucket: this.params.Bucket,
            Key: key,
          }, (err, data) => {
            if (err) {
              // eslint-disable-next-line max-len
              logger.showError(`Dashboard ${dashboard.Key.split('/')[dashboard.Key.split('/').length - 1].split('.')[0]} not present in location s3://${this.params.Bucket}/${key}.`);
            } else {
              this.components.dashboards.saveDashboard(
                dashboard.Key.split('/')[dashboard.Key.split('/').length - 1].split('.')[0],
                JSON.parse(data.Body.toString()),
                false,
              );
            }
          });
        }
      });
      logger.showResult(successMessage);
    });
  } else {
    logger.showError(`Unsupported entity type ${entityType}`);
  }
};

module.exports = S3;
