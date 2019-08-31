const Logger = require('./logger');

const logger = new Logger('authentication');

function add(url, options) {
  const auth = options.auth || {};
  const headers = options.headers || {};
  let authenticatedUrl = url;
  if (auth.bearer) {
    headers.Authorization = `Bearer ${options.auth.bearer}`;
  } else if (auth.username && auth.password) {
    const urlParts = url.split('://');
    authenticatedUrl = `${urlParts[0]}://${encodeURIComponent(auth.username)}:${encodeURIComponent(auth.password)}@${urlParts[1]}`;
  } else {
    logger.showError('Missing authentication');
  }
  return { url: authenticatedUrl, headers };
}

module.exports = {
  add,
};
