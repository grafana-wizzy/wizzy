[wizzy](https://github.com/utkarshcmu/wizzy) [![npm version](https://badge.fury.io/js/wizzy.svg)](https://badge.fury.io/js/wizzy) [![Circle CI](https://circleci.com/gh/utkarshcmu/wizzy.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/utkarshcmu/wizzy)
================
`wizzy` is a rich user-friendly command line tool written in node.js to manage Grafana entities. It can save you hundreds of clicks in a day when editing and managing your Grafana dashboards. It can also be used to store dashboards in a Github repo making Grafana dashboards version controlled.

# Understanding the use case

We want/need to edit and modify dashboards everyday and managing tens and hundreds of dashboard becomes hard for a Grafana user and as well as an administrator. To manage Grafana dashboards on command line makes it easier for the users who prefer keyboard over hundred of clicks. `wizzy` brings you that power to change dashboards on your command line. Together we can make it better and rich in terms of commands it support.

# Flow

1. A user makes a local directory to store dashboards and initialize it with Git version control.

2. Then the user imports and make a copy of the dashboard(s) in the local directory so that changes can be made on these imported dashboards.

3. The user uses `wizzy` cli tool to modify dashboard or dashboards and export it back to Grafana to replace the old one.

4. The user also can push it to a Git repo once he is done making changes to track what changed on a dashboard.

# Getting started with wizzy

- Install nodejs by downloading it from nodejs.org. (https://nodejs.org/en/download/). After installing nodejs, run following commands:
```
$ node -v
$ npm -v
```
Note: Please make sure node version is above 5.10.1.

- Install wizzy using npm
```
$ npm install -g wizzy
	- Use sudo if needed or permission was denied
$ wizzy version
```

- Create a Github repo for storing dashboards
```
$ mkdir grafana-dash
$ cd grafana-dash
$ git init
	- optional step to store dashboards in a github repo
```

- Initialize wizzy
```
$ wizzy init
```
- Set Grafana properties in wizzy's config
```
$ wizzy set grafana url GRAFANA_URL
	- a required setting to connect to Grafana installation
$ wizzy set grafana username USERNAME
	- if anonymous access to Grafana is disabled.
$ wizzy set grafana password PASSWORD
	- if anonymous access to Grafana is disabled.
```
Note: Add `conf` directory to .gitignore to avoid checking your credentials into git repo.

- Test wizzy setup
```
$ wizzy status
```

You are ready to use wizzy. Import your first dashboard now!

# Dashboard Commands

## Dashboard Terminology
- *local dashboard* - a json dashboard file under dashboards directory on local disk
- *remote dashboard* - a dashboard currently live in Grafana

## Remote Commands
These commands operates directly on remote dashboards in Grafana via API, so please use them carefully. Dashboard Context(which is explained next) is not supported by these commands currently as they will interact with Grafana API directly.

### Dashboard Commands
```
$ wizzy list dashboards
	- prints list of dashboards from Grafana in a tabular format
$ wizzy show dashboard DASHBOARD_SLUG
	- prints a remote dashboard from Grafana
$ wizzy import dashboards
	- copies all remote dashboards jsons and creates/replaces local dashboard jsons
$ wizzy import dashboard DASHBOARD_SLUG
	- copies a remote dashboard json and creates a local dashboard
$ wizzy export dashboard DASHBOARD_SLUG
	- exports a local dashboard to be saved as a remote dashboard and go live
$ wizzy export new-dashboard DASHBOARD_SLUG
	- exports a new local dashboard to be saved as a remote dashboard and go live
$ wizzy delete dashboard DASHBOARD_SLUG
	- deletes a remote dashboard from Grafana
```

### Organization Commands
```
$ wizzy import orgs
	- imports all orgs in JSON format and stores under orgs directory
$ wizzy import org ORG_ID
	- imports an org with ORG_ID
$ wizzy create org ORG_NAME
	- creates an org in Grafana
$ wizzy show orgs
	- shows all orgs from Grafana
$ wizzy show org ORG_ID
	- shows an org from Grafana
$ wizzy delete org ORG_ID
	- deletes an org in Grafana
$ wizzy export org ORG_ID
	- exports an org from local JSON to replace the one in Grafana
```

### Datasource Commands
```
$ wizzy import datasources
	- imports all datasources in JSON format and store under datasources directory
$ wizzy import datasource DATASOURCE_ID
	- imports a datasource in JSON format and store under datasources directory
$ wizzy show datasources
	- shows you all the datasources in JSON
$ wizzy show datasource DATASOURCE_ID
	- shows you a datasource in JSON
$ wizzy export datasource DATASOURCE_ID
	- exports local datasource JSON object to replace the one in Grafana
```

## Dashboard Context
A user can set the dashboard context in wizzy by the following command so that the wizzy cli is aware about the local dashboard on which it should operate. This is an optional setting for some commands and mandatory for other commands, which makes wizzy cli more intuitive and user-friendly.
```
wizzy set context dashboard DASHBOARD_SLUG
```
Note: Once context is set, wizzy will use this dashboard as default if no dashboard is supplied. It will be mentioned in the documentation where setting dashboard context is required.

## Local Commands
These commands operates on local json file based dashboards and support Dashboard Context.

### Dashboard Commands
These commands impacts the dashboard wide changes
```
$ wizzy summarize dashboard DASHBOARD_SLUG
	- prints summary of a local dashboard
$ wizzy change panels datasource OLD_DATASOURCE NEW_DATASOURCE
	- changes OLD_DATASOURCE to NEW_DATASOURCE for all panels on a dashboard
```

### Orgs Commands
```
$ wizzy summarize orgs
	- prints summary of all local orgs
```

### Datasources Commands
```
$ wizzy summarize datasources
	- prints summary of all local datasources
```

### Row Commands
```
$ wizzy copy row SOURCE_ROW_NUMBER DESTINATION_ROW_NUMBER
	- copies a row from one position to another on the same dashboard
$ wizzy copy row SOURCE_ROW_NUMBER DESTINATION_DASHBOARD_SLUG.ROW_NUMBER
	- copies a row from one dashboard to another dashboard
$ wizzy move row SOURCE_ROW_NUMBER DESTINATION_ROW_NUMBER
	- moves a row from one position to another on the same dashboard
$ wizzy move row SOURCE_ROW_NUMBER DESTINATION_DASHBOARD_SLUG.ROW_NUMBER
	- moves a row from one dashboard to another dashboard
$ wizzy remove row SOURCE_ROW_NUMBER
	- removes a row from the current dashboard
```

### Panel Commands
```
$ wizzy copy panel SOURCE_ROW.PANEL_NUMBER DESTINATION_ROW_NUMBER.PANEL_NUMBER
	- copies a panel from current row to another row on the same dashboard
$ wizzy copy panel SOURCE_ROW.PANEL_NUMBER DESTINATION_DASHBOARD_SLUG.ROW_NUMBER.PANEL_NUMBER
	- copies a panel from current dashboard to another dashboard
$ wizzy move panel SOURCE_ROW.PANEL_NUMBER DESTINATION_ROW_NUMBER.PANEL_NUMBER
	- moves a panel from current row to another row on the same dashboard
$ wizzy move panel SOURCE_ROW.PANEL_NUMBER DESTINATION_DASHBOARD_SLUG.ROW_NUMBER.PANEL_NUMBER
	- moves a panel from current dashboard to another dashboard
$ wizzy remove panel SOURCE_ROW.PANEL_NUMBER
	- removes a panel from current dashboard

```

### Template Variables Commands
```
$ wizzy copy temp-var SOURCE_TEMP-VAR_NUMBER DESTINATION_DASHBOARD_SLUG.TEMP-VAR_NUMBER
	- copies a template variable from current dashboard to another dashboard
$ wizzy move temp-var SOURCE_TEMP-VAR_NUMBER DESTINATION_DASHBOARD_SLUG.TEMP-VAR_NUMBER
	- moves a template variable from current dashboard to another dashboard
$ wizzy remove temp-var SOURCE_TEMP-VAR_NUMBER
	- removes a template variable from current dashboard
$ wizzy extract temp-var SOURCE_TEMP-VAR_NUMBER TEMP_VAR_NAME
	- copies a template variable from current dashboard to a json file under temp-vars directory for resuse
$ wizzy insert temp-var TEMP_VAR_NAME DASHBOARD_SLUG
	- copies a template variable from JSON file to the specified dashboard otherwise to the context dashboard, if not specified
```
Note: wizzy removes `version` field from the imported dashboard before saving it to the disk as version is something what Grafana takes care of for a dashboard. ROW_NUMBER and PANEL_NUMBER starts from 1.

# Set Configuration commands
Grafana properties can be set in wizzy by running following commands, if you have not set already:
```
$ wizzy set grafana url GRAFANA_URL
$ wizzy set grafana username USERNAME
$ wizzy set grafana password PASSWORD
$ wizzy set grafana debug_api true
	- an optional setting to debug Grafana API calls, `false` by default
$ wizzy set context dashboard DASHBOARD_SLUG
```
# Help Commands
Help commands lets you explore wizzy's info, health, configuration.
```
$ wizzy conf
	- shows wizzy configuration
$ wizzy init
	- only to be used while setting up wizzy for the first time
$ wizzy status
$ wizzy help
$ wizzy version
```

# Grafana.net commands
wizzy can interact now with Grafana.net. It can list and download dashboards from Grafana.net.
```
$ wizzy list gnet dashboards <FILTER>
	- lists all the dashboards and if filter is present then filters out the dashboards according to it.
	- for example: 'wizzy list gnet dashboards ds=graphite' lists all dashboards with datasource = graphite.
$ wizzy download gnet dashboard DASHBOARD_ID REVISION_ID
	- Download a dashboard json from Grafana.net and stores under dashboards directory.
```

# Author
Utkarsh Bhatnagar, @utkarshcmu, <utkarsh.cmu@gmail.com>
