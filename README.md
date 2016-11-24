[wizzy](https://github.com/utkarshcmu/wizzy) [![Circle CI](https://circleci.com/gh/utkarshcmu/wizzy.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/utkarshcmu/wizzy) [![Coverage Status](https://coveralls.io/repos/github/utkarshcmu/wizzy/badge.svg?branch=master&bust=1)](https://coveralls.io/github/utkarshcmu/wizzy?branch=master)
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
$ wizzy grafana debug_api true - optional, false by default
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

###Convetions
- *local dashboard* - a json file representing a dashboard located under dashboards directory.
- *remote dashboard* - a dashbord currently live/stored in Grafana.

### Local Commands
These commands operates on json dashboard files under dashboards directory locally on disk.
```
$ wizzy import dashboard DASHBOARD_SLUG - imports a remote dashboard and creates a local json file
$ wizzy summarize dashboard DASHBOARD_SLUG - prints summarized version of a local dashboard
```

### Remote Commands
These commands operates directly on Grafana via API, so please use them carefully.
```
$ wizzy show dashboard DASHBOARD_SLUG - prints a remote dashboard
$ wizzy delete dashboard DASHBOARD_SLUG - deletes a remote dashboard
$ wizzy export dashboard DASHBOARD_SLUG - exports a local dashboard to be saved as a remote dashboard and go live
$ wizzy export newdash DASHBOARD_SLUG - exports a new local dashboard to be saved as a remote dashboard and go live
```

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
