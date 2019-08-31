const _ = require('lodash');
const GIFEncoder = require('gifencoder');
const pngFileStream = require('png-file-stream');

const authentication = require('../../util/authentication');
const DashList = require('../../local/dashlist');
const LocalFS = require('../../util/localfs');
const Logger = require('../../util/logger');
const request = require('../../util/request');

const logger = new Logger('clipSrv');
const localfs = new LocalFS();
let encoder;
let clipConfig;

function ClipSrv(config) {
  clipConfig = config;
}

ClipSrv.prototype.dashboard = function(grafanaURL, options, dashboardName) {
  const { url, headers } = authentication.add(
    // eslint-disable-next-line max-len
    `${createURL(grafanaURL, 'render-dashboard', dashboardName)}?width=${clipConfig.render_width}&height=${clipConfig.render_height}&timeout=${clipConfig.render_timeout}`,
    options,
  );
  const now = (new Date()).getTime();
  // Taking 24 screenshots for last 24 hours
  logger.justShow('Taking 24 snapshots.');
  let i = 0;
  while (i < 24) {
    const from = now - ((i + 1) * 60 * 60000);
    const to = now - (i * 60 * 60000);
    const completeUrl = `${url}&from=${from}&to=${to}`;
    const response = request.getSync(completeUrl, { headers });
    if (response.statusCode === 200) {
      const filename = `temp/${String.fromCharCode(120 - i)}.png`;
      localfs.writeFile(filename, response.getBody());
      logger.showResult(`Took snapshot ${i + 1}.`);
    } else {
      logger.showError(`Snapshot ${i + 1} failed. Please increase timeout.`);
    }
    i++;
  }
  logger.showResult('Snapshots rendering completed.');
  logger.justShow('Waiting 5 seconds before generating clip.');
  interval(() => {
    createGif(dashboardName);
  }, 5000, 1);
};

ClipSrv.prototype.dashboardByTag = function(grafanaURL, options, tagName) {
  const { url, headers } = authentication.add(
    `${createURL(grafanaURL, 'search-dashboard')}?tag=${tagName}`,
    options,
  );
  const searchResponse = request.getSync(url, { headers });
  const responseBody = JSON.parse(searchResponse.getBody('utf8'));
  if (searchResponse.statusCode === 200 && responseBody.length > 0) {
    logger.showOutput('Taking dashboard snapshots.');
    _.each(responseBody, (dashboard) => {
      const dashName = dashboard.uri.substring(3);
      const { dashUrl, dashHeaders } = authentication.add(
        // eslint-disable-next-line max-len
        `${createURL(grafanaURL, 'render-dashboard', dashName)}?width=${clipConfig.render_width}&height=${clipConfig.render_height}&timeout=${clipConfig.render_timeout}`,
        options,
      );
      const response = request.getSync(dashUrl, { headers: dashHeaders });
      if (response.statusCode === 200) {
        const filename = `temp/${dashName}.png`;
        localfs.writeFile(filename, response.getBody());
        logger.showResult(`Took snapshot of ${dashName} dashbaord.`);
      } else {
        logger.showError(`Snapshot of ${dashName} dashbaord failed. Please increase timeout.`);
      }
    });
  } else {
    logger.showError('No content available to make clip.');
  }
  logger.showResult('Snapshots rendering completed.');
  logger.justShow('Waiting 5 seconds before generating clip.');
  interval(() => {
    createGif(tagName);
  }, 5000, 1);
};

ClipSrv.prototype.dashList = function(grafanaURL, options, listName) {
  const dashList = new DashList();
  const list = dashList.getList(listName);
  if (list.length < 1) {
    logger.showOutput(`No dashboard found in dashboard list ${listName}`);
  } else {
    _.each(list, (dashName) => {
      const { dashUrl, dashHeaders } = authentication.add(
        // eslint-disable-next-line max-len
        `${createURL(grafanaURL, 'render-dashboard', dashName)}?width=${clipConfig.render_width}&height=${clipConfig.render_height}&timeout=${clipConfig.render_timeout}`,
        options,
      );
      const response = request.getSync(dashUrl, { headers: dashHeaders });
      if (response.statusCode === 200) {
        const filename = `temp/${dashName}.png`;
        localfs.writeFile(filename, response.getBody());
        logger.showResult(`Took snapshot of ${dashName} dashbaord.`);
      } else {
        logger.showError(`Snapshot of ${dashName} dashbaord failed. Please increase timeout.`);
      }
    });
  }
  logger.showResult('Snapshots rendering completed.');
  logger.justShow('Waiting 5 seconds before generating clip.');
  interval(() => {
    createGif(listName);
  }, 5000, 1);
};

function createGif(clipName) {
  localfs.createDirIfNotExists('clips', false);
  encoder = new GIFEncoder(clipConfig.canvas_width, clipConfig.canvas_height);
  pngFileStream('temp/*.png')
    .pipe(encoder.createWriteStream({ repeat: -1, delay: parseInt(clipConfig.delay), quality: 40 }))
    .pipe(localfs.writeStream(`clips/${clipName}.gif`));
  logger.showResult(`Successfully created ${clipName} clip under clips directory.`);
  logger.justShow('Please delete temp directory before creating next clip.');
}

function createURL(grafanaURL, entityType, entityValue) {
  if (entityType === 'render-dashboard') {
    grafanaURL += `/render/dashboard/db/${entityValue}`;
  } else if (entityType === 'search-dashboard') {
    grafanaURL += '/api/search';
  }
  return grafanaURL;
}

// interval function for delay
function interval(func, wait, times) {
  const interv = ((w, t) => () => {
    if (typeof t === 'undefined' || t-- > 0) {
      setTimeout(interv, w);
      try {
        func.call(null);
      } catch (e) {
        t = 0;
        throw e.toString();
      }
    }
  })(wait, times);
  setTimeout(interv, wait);
}

module.exports = ClipSrv;
