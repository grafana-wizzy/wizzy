[wizzy](https://github.com/utkarshcmu/wizzy) [![Circle CI](https://circleci.com/gh/utkarshcmu/wizzy.svg?style=svg)](https://circleci.com/gh/utkarshcmu/wizzy)
================
`wizzy` is a user-friendly command line tool written in node.js to manage Grafana entities. It can also be used to store dashboards in a Github repo making Grafana dashboards version controlled.

# How to start using `wizzy` with Grafana?

- Install nodejs by downloading it from nodejs.org. (https://nodejs.org/en/download/). After installing nodejs, run following commands:
```
$ node -v
$ npm -v
```
Make sure node version is above 5.10.1.
- Install wizzy using npm
```
$ npm install -g wizzy (Use sudo if needed)
$ wizzy version
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
$ wizzy grafana url GRAFANA_URL - required setting
$ wizzy grafana username user - depends on your access to Grafana, set if you have one
$ wizzy grafana password password - depends on your access to Grafana, set if you have one
$ wizzy grafana debug_api - optional, false by default
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

## Dashboard Commands
```
$ wizzy import dashboard DASHBOARD_SLUG - imports a Grafana dashboard and creates dashboard JSON file under dashboards directory
$ wizzy export dashboard DASHBOARD_SLUG - exports an existing dashboard from JSON file from dashboards directory to Grafana and saves it
$ wizzy export new-dashboard DASHBOARD_SLUG - exports a new dashboard from JSON file from dashboards directory to Grafana and saves it
$ wizzy show dashboard DASHBOARD_SLUG - pretty print dashboard json from Grafana
$ wizzy delete dashboard DASHBOARD_SLUG - deletes a dashbaord in Grafana

```

## Organization Commands
```
$ wizzy create org ORG_NAME - creates an org in Grafana
$ wizzy show orgs - shows all orgs from Grafana
$ wizzy show org ORG_ID - shows an org from Grafana
$ wiizy delete org ORG_ID - deletes an org in Grafana
```

# Author
Utkarsh Bhatnagar, @utkrashcmu, <utkarsh.cmu@gmail.com>
