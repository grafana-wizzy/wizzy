function formatError(error, response) {
  let output = '';

  if (response) {
    output += `Grafana API response status code = ${response.statusCode}\n`;
  } else {
    output += 'No Grafana API response\n';
  }

  if (error) {
    output += error;
  } else {
    output += 'No error body from Grafana API.';
  }

  return output;
}

module.exports = {
  formatError,
};
