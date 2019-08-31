const request = require('request');
const syncRequest = require('sync-request');

function get(options, callback) {
  request.get(options, callback);
}

function post(options, callback) {
  request.post(options, callback);
}

function getSync(url, options) {
  return reqSync('GET', url, options);
}

function postSync(url, options) {
  return reqSync('POST', url, options);
}

function reqSync(method, url, options) {
  return syncRequest(method, url, options);
}

module.exports = {
  get,
  post,
  getSync,
  postSync,
  reqSync,
};
