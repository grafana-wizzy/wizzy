#!/usr/bin/env node
"use strict";

var Logger = require('./logger.js');
var logger = new Logger('help');

var help;

function Help() {
	help = '\nUsage: wizzy [commands]\n';
	addCommandsToHelp();
}

Help.prototype.showHelp = function() {
	logger.justShow(help);
};

function addCommandsToHelp() {

	addRemoteCommands();
	addLocalCommands();
	addExternalCommands();
	addHelpCommands();
	addConfigurationCommands();
}

function addRemoteCommands() {
	help += '\n Remote Commands:\n';
	addRemoteDashboardCommands();
	addRemoteDatasourceCommands();
	addRemoteOrgCommands();
}

function addLocalCommands() {
	help += '\n Local Commands:\n';
	addLocalDashboardCommands();
	addLocalRowCommands();
	addLocalPanelCommands();
	addLocalTempVarsCommands();
	addLocalDashboardTagsCommands();
	addLocalDatasourceCommands();
	addLocalOrgCommands();
	addLocalDashListCommands();
}

function addExternalCommands() {
	help += '\n External Commands:\n';
	addExternalGnetCommands();
	addExternalS3Commands();
}

function addHelpCommands() {
	help += '\n Help Commands:\n';
	help += '\n  wizzy conf';
	help += '\n  wizzy init';
	help += '\n  wizzy status';
	help += '\n  wizzy help';
	help += '\n  wizzy version';
	help += '\n';
}

function addConfigurationCommands() {
	help += '\n Configuration Commands:\n';
	addGrafanaConfiguration();
	addContextConfiguration();
	addClipConfiguration();
	addS3Configuration();
}

function addRemoteDashboardCommands() {
	help += '\n  Dashboard Commands:\n';
	help += '\n   wizzy list dashboards';
	help += '\n   wizzy list dash-tags';
	help += '\n   wizzy show dashboard DASHBOARD_SLUG';
	help += '\n   wizzy import dashboards';
	help += '\n   wizzy import dashboard DASHBOARD_SLUG';
	help += '\n   wizzy export dashboards';
	help += '\n   wizzy export dashboard DASHBOARD_SLUG';
	help += '\n   wizzy delete dashboard DASHBOARD_SLUG';
	help += '\n   wizzy clip dashboard DASHBOARD_SLUG';
	help += '\n   wizzy clip dashboards-by-tag DASHBOARD_TAG_NAME';
	help += '\n   wizzy clip dash-list DASH_LIST_NAME';
	help += '\n';
}

function addRemoteDatasourceCommands() {
	help += '\n  Datasource Commands:\n';
	help += '\n   wizzy show datasources';
	help += '\n   wizzy show datasource DATASOURCE_NAME';
	help += '\n   wizzy import datasources';
	help += '\n   wizzy import datasource DATASOURCE_NAME';
	help += '\n   wizzy export datasources';
	help += '\n   wizzy export datasource DATASOURCE_NAME';
	help += '\n';
}

function addRemoteOrgCommands() {
	help += '\n  Org Commands:\n';
	help += '\n   wizzy show orgs';
	help += '\n   wizzy show org ORG_ID';
	help += '\n   wizzy import orgs';
	help += '\n   wizzy import org ORG_ID';
	help += '\n   wizzy create org ORG_ID';
	help += '\n   wizzy delete org ORG_ID';
	help += '\n   wizzy export org ORG_ID';
	help += '\n';
}

function addLocalDashboardCommands() {
	help += '\n  Dashboard Commands:\n';
	help += '\n   wizzy summarize dashboard <DASHBOARD_SLUG>';
	help += '\n   wizzy change panels datasource OLD_DATASOURCE NEW_DATASOURCE';
	help += '\n   wizzy list panels datasource DATASOURCE';
	help += '\n';
}

function addLocalRowCommands() {
	help += '\n  Row Commands:\n';
	help += '\n   wizzy copy row SOURCE DESTINATION';
	help += '\n   wizzy move row SOURCE DESTINATION';
	help += '\n   wizzy remove row ROW_NUMBER';
	help += '\n   wizzy extract row ROW_NUMBER ROW_NAME';
	help += '\n   wizzy insert row ROW_NAME <DASHBOARD_SLUG>';
	help += '\n';
}

function addLocalPanelCommands() {
	help += '\n  Panel Commands:\n';
	help += '\n   wizzy copy panel SOURCE DESTINATION';
	help += '\n   wizzy move panel SOURCE DESTINATION';
	help += '\n   wizzy remove panel ROW_NUMBER.PANEL_NUMBER';
	help += '\n   wizzy extract row ROW_NUMBER.PANEL_NUMBER PANEL_NAME';
	help += '\n   wizzy insert row PANEL_NAME DESTINATION';
	help += '\n';
}

function addLocalTempVarsCommands() {
	help += '\n  Template Variable Commands:\n';
	help += '\n   wizzy copy temp-var SOURCE DESTINATION';
	help += '\n   wizzy move temp-var SOURCE DESTINATION';
	help += '\n   wizzy remove temp-var TEMP-VAR_NUMBER';
	help += '\n   wizzy extract temp-var VAR_NUMBER TEMP-VAR_NAME';
	help += '\n   wizzy insert temp-var TEMP-VAR_NAME <DASHBOARD_SLUG>';
	help += '\n';
}

function addLocalDatasourceCommands() {
	help += '\n  Datasource Commands:\n';
	help += '\n   wizzy summarize datasources';
	help += '\n';
}

function addLocalOrgCommands() {
	help += '\n  Org Commands:\n';
	help += '\n   wizzy summarize orgs';
	help += '\n';
}

function addLocalDashListCommands() {
	help += '\n  DashList Commands:\n';
	help += '\n   wizzy create dash-list DASH_LIST_NAME';
	help += '\n   wizzy add to-dash-list DASH_LIST_NAME DASHBOARD_SLUG';
	help += '\n   wizzy remove from-dash-list DASH_LIST_NAME DASHBOARD_SLUG';
	help += '\n   wizzy show dash-list DASH_LIST_NAME';
	help += '\n   wizzy clear dash-list DASH_LIST_NAME';
	help += '\n   wizzy delete dash-list DASH_LIST_NAME';
	help += '\n';
}

function addLocalDashboardTagsCommands() {
	help += '\n  Dashboard Tags Commands:\n';
	help += '\n   wizzy copy dash-tags DASHBOARD_SLUG';
	help += '\n   wizzy extract dash-tags DASH-TAGS_NAME';
	help += '\n   wizzy insert DASH-TAGS_NAME <DASHBOARD_SLUG>';
	help += '\n';
}

function addExternalGnetCommands() {
	help += '\n  Grafana.net Commands:\n';
	help += '\n   wizzy list gnet dashboards <FILTER>';
	help += '\n   wizzy download gnet dashboard DASHBOARD_ID REVISION_ID';
	help += '\n';
}

function addExternalS3Commands() {
	help += '\n  S3 Commands:\n';
	help += '\n   wizzy upload to-s3 dashboards';
	help += '\n   wizzy upload to-s3 dashboard DASHBOARD_SLUG';
	help += '\n   wizzy download from-s3 dashboards';
	help += '\n   wizzy download from-s3 dashboard DASHBOARD_SLUG';
	help += '\n';
}

function addGrafanaConfiguration() {
	help += '\n  Grafana Configuration Commands:\n';
	help += '\n   wizzy set grafana url GRAFANA_URL';
	help += '\n   wizzy set grafana username GRAFANA_USERNAME';
	help += '\n   wizzy set grafana password GRAFANA_PASSWORD';
	help += '\n   wizzy set grafana headers HEADER_NAME HEADER_VALUE';
	help += '\n   wizzy set grafana authorization false';
	help += '\n   wizzy set grafana debug_api true';
	help += '\n   wizzy set grafana envs ENV_NAME url GRAFANA_URL';
	help += '\n   wizzy unset grafana username';
	help += '\n   wizzy unset grafana envs ENV_NAME url';
	help += '\n';
}

function addContextConfiguration() {
	help += '\n  Context Configuration Commands:\n';
	help += '\n   wizzy set context dashboard DASHBOARD_SLUG';
	help += '\n   wizzy set context grafana ENV_NAME';
	help += '\n';
}

function addClipConfiguration() {
	help += '\n  Clip Configuration Commands:\n';
	help += '\n   wizzy set clip render_height HEIGHT';
	help += '\n   wizzy set clip render_width WIDTH';
	help += '\n   wizzy set clip render_timeout TIMEOUT';
	help += '\n   wizzy set clip canvas_height HEIGHT';
	help += '\n   wizzy set clip canvas_width WIDTH';
	help += '\n   wizzy set clip delay DELAY';
	help += '\n';
}

function addS3Configuration() {
	help += '\n  S3 Configuration Commands:\n';
	help += '\n   wizzy set s3 bucket_name BUCKET_NAME';
	help += '\n   wizzy set s3 path PATH';
	help += '\n';
}

module.exports = Help;