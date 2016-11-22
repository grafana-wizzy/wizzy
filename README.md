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
$ wizzy grafana username user
$ wizzy grafana password password
```
- Test wizzy setup
```
$ wizzy status
```

# Available Commands

## Help Commands
Help commands are built-in commands to help you debug wizzy's configuration. Also, they show which commands are valid help commands.
```
$ wizzy help - shows wizzy help
$ wizzy conf - shows wizzy configuration
$ wizzy version - shows wizzy version
```

## Import Commands
These commands imports dashboard JSONs from Grafana and create local dashboard JSON files under dashboards directory
```
$ wizzy import dashboard DASHBOARD_NAME - imports a Grafana dashboard and creates dashboard JSON file
$ wizzy import dashboards - imports all Grafana dashboards and creates their respective dashboard JSON files
```

## Export and Publish Commands
These commands exports local JSONs from dashboards directory to Grafana and will replace existing dashboards. Please be careful while using them!
```
$ wizzy export dashboard DASHBOARD_NAME - imports local json dashboard in Grafana and open in your browser for viewing
$ wizzy publish dashboard DASHBOARD_NAME - saves or overrides Grafana dashboard with same name by local dashboard JSON
```

## Organization Commands
```
$ wizzy create org ORG_NAME - creates an org in Grafana
```
