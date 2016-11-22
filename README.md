[wizzy](https://github.com/utkarshcmu/wizzy) [![Circle CI](https://circleci.com/gh/utkarshcmu/wizzy.svg?style=svg)](https://circleci.com/gh/utkarshcmu/wizzy)
================
Manage Grafana with Easy Wizzy

# Installation
```
npm install wizzy
```
================
# Commands

## Help
- `wizzy help`

## Initializing wizzy
- `wizzy init`

## Configure Grafana
- `wizzy grafana url GRAFANA_URL`
- `wizzy grafana user user`
- `wizzy grafana password password`

## Show Configuration
- `wizzy conf`

## Create a Grafana entity
- `wizzy create org ORG_NAME`
- `wizzy create dashboard DASHBOARD_NAME`

## Use a Grafana entity in Context
- `wizzy use org ORG_NAME`
- `wizzy use dashboard DASHBOARD_NAME`
- `wizzy use row DASHBOARD_ROW`

## Add dashboard elements
- `wizzy add row ROW_NAME`
- `wizzy add panel PANEL_TITLE --type graph --width 250`

