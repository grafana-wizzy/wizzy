[wizzy](https://github.com/utkarshcmu/wizzy) [![Circle CI](https://circleci.com/gh/utkarshcmu/wizzy.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/utkarshcmu/wizzy) [![Coverage Status](https://coveralls.io/repos/github/utkarshcmu/wizzy/badge.svg?branch=master&bust=1)](https://coveralls.io/github/utkarshcmu/wizzy?branch=master)
================
`wizzy` is a rich user-friendly command line tool written in node.js to manage Grafana entities. It can save you hundreds of clicks in a day when editing and managing your Grafana dashboards. It can also be used to store dashboards in a Github repo making Grafana dashboards version controlled.

# Getting statrted with wizzy

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

You are ready to use wizzy. Read further or check examples.

# Available Commands

## Help Commands
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

## Set Grafana properties
Grafana properties can be set in wizzy by running following commands, if you have not set already:
```
$ wizzy set grafana url GRAFANA_URL
$ wizzy set grafana username USERNAME
$ wizzy set grafana password PASSWORD
$ wizzy set grafana debug_api true
	- an optional setting to debug Grafana API calls, `false` by default
```

## Command Set
There can be multiple arguments, representing Grafana entities, associated with each of the following command sets. This is just a broader classification of the rich command set wizzy has.
```
$ wizzy set ....
$ wizzy create ....
$ wizzy show ....
$ wizzy summarize ....
$ wizzy use ....
$ wizzy move ....
$ wizzy copy ....
$ wizzy delete ....
$ wizzy import ....
$ wizzy export ....
```
Note: Please read further to see example use cases and commands.

## Dashboard Commands

###Dashboard Terminology
- *local dashboard* - a json dashboard file under dashboards directory on local disk
- *remote dashboard* - a dashboard currently live in Grafana

### Dashboard Context
A user can set the dashboard context in wizzy by the `use` command so that the wizzy is aware about the local dashboard on which it should operate. This is an optional setting for some commands and mandatory for other commands, which makes wizzy cli more intuitive and user-friendly.
```
wizzy use dashboard DASHBOARD_SLUG
```
Note: Once context is set, wizzy will use this dashboard as default if no dashboard is supplied. It will be mentioned in the documentation where setting dashboard context is required.


### Local Commands
These commands operates on local json file based dashboards.
```
$ wizzy import dashboard DASHBOARD_SLUG
	- copies a remote dashboard json and creates a local dashboard
$ wizzy summarize dashboard DASHBOARD_SLUG
	- prints summarized version of a local dashboard
```

### Remote Commands
These commands operates directly on remote dashboards in Grafana via API, so please use them carefully. No need of setting Dashboard Context for these commands as they will interact with Grafana API directly.
```
$ wizzy show dashboard DASHBOARD_SLUG
	- prints a remote dashboard from Grafana
$ wizzy delete dashboard DASHBOARD_SLUG
	- deletes a remote dashboard from Grafana
$ wizzy export dashboard DASHBOARD_SLUG
	- exports a local dashboard to be saved as a remote dashboard and go live
$ wizzy export newdash DASHBOARD_SLUG
	- exports a new local dashboard to be saved as a remote dashboard and go live
```

### Row Commands
These commands operate on local dashboards for moving dashboards components quickly. Please set Dashboard Context to use them.
```
$ wizzy move row ROW_NUMBER to ROW_NUMBER
	- moves a row from one position to another on the same dashboard
$ wizzy move row ROW_NUMBER to DASHBOARD_2_SLUG.ROW_NUMBER
	- moves a row from one dashboard to another dashboard
$ wizzy copy row ROW_NUMBER to ROW_NUMBER
	- copies a row from one position to another on the same dashboard
$ wizzy copy row ROW_NUMBER to DASHBOARD_2_SLUG.ROW_NUMBER
	- copies a row from one dashboard to another dashboard
```
Note: ROW_NUMBER starts from 1.

### Panel Commands
These commands operate on local dashboards for editing the dashboards quickly. Please set Dashboard Context to use them.
```
$ wizzy move panel PANEL_NUMBER to ROW_NUMBER.PANEL_NUMBER
	- moves a panel from current row to another row on the same dashboard
$ wizzy move panel PANEL_NUMBER to DASHBOARD_2_SLUG.ROW_NUMBER.PANEL_NUMBER
	- moves a panel from current dashboard to another dashboard
$ wizzy copy panel PANEL_NUMBER to ROW_NUMBER.PANEL_NUMBER
	- copies a panel from current row to another row on the same dashboard
$ wizzy copy panel PANEL_NUMBER to DASHBOARD_2_SLUG.ROW_NUMBER.PANEL_NUMBER
	- copies a panel from current dashboard to another dashboard
```
Note: PANEL_NUMBER starts from 1 too.

## Organization Commands
These commands operates directly on Grafana via API, so please use them carefully.
```
$ wizzy create org ORG_NAME - creates an org in Grafana
$ wizzy show orgs - shows all orgs from Grafana
$ wizzy show org ORG_ID - shows an org from Grafana
$ wiizy delete org ORG_ID - deletes an org in Grafana
```

# Author
Utkarsh Bhatnagar, @utkrashcmu, <utkarsh.cmu@gmail.com>
