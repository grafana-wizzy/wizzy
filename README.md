[wizzy](https://github.com/utkarshcmu/wizzy) [![Circle CI](https://circleci.com/gh/utkarshcmu/wizzy.svg?style=svg)](https://circleci.com/gh/utkarshcmu/wizzy)
================
`wizzy` is a user-friendly command line tool to manage Grafana entities. It can also be used to store dashboards in a Github repo creating version control available for dashboards. It also stores local history of successful and failed commands so that its easy to check which commands were executed in the past.

# How to start using `wizzy` with Grafana?
- Install wizzy using npm
```
$ npm install wizzy
```
- Create a Github repo for storing dashboards
```
$ mkdir grafana-dash
$ cd grafana-dash
$ git init
```
- Initialize wizzy
```
$ wizzy init
```
- Configure wizzy for Grafana
```
$ wizzy grafana url GRAFANA_URL
$ wizzy grafana user user
$ wizzy grafana password password
```
- Test wizzy setup
```
$ wizzy test setup
```

# Available Commands

## Help Commands
Help commands are built-in commands to help you debug wizzy's configuration. Also, they show which commands are valid help commands.
```
- wizzy help : shows wizzy help
- wizzy conf : shows wizzy configuration
- wizzy version : shows wizzy version
```

## Context Commands
These commands set wizzy's context.
```
- wizzy use org ORG_NAME : sets the context to use an org for all future commands
- wizzy use dashboard DASHBOARD_NAME : sets the context to use a dashboard for all future commands
- wizzy use row DASHBOARD_ROW : sets the context to use a row in a dashboard for all future commands
```

## Remote Execution Commands
These commands executes actions via API directly to Grafana. Please be careful while using them!
```
- wizzy create org ORG_NAME : creates an org in Grafana
- wizzy delete org ORG_NAME : deletes an org in Grafana
- wizzy export dashboard DASHBOARD_NAME : imports local json dashboard in Grafana and open in your browser for viewing
- wizzy publish dashboard DASHBOARD_NAME : saves or overrides Grafana dashboard with same name by local json dashboard
```

## Local Execution Commands
These commands are executed locally and make changes to dashboard's local json.
```
- wizzy create dashboard DASHBOARD_NAME : creates a new json dashboard under dashboards directory
- wizzy add row ROW_NAME : adds a row in a dashboard
- wizzy add panel PANEL_TITLE --type graph --width 250 : adds a panel in a row
```
