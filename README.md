[wizzy](https://github.com/utkarshcmu/wizzy) [![npm version](https://badge.fury.io/js/wizzy.svg)](https://badge.fury.io/js/wizzy) [![Circle CI](https://circleci.com/gh/utkarshcmu/wizzy.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/utkarshcmu/wizzy)
================
`wizzy` is a rich user-friendly command line tool written in node.js to manage Grafana entities. It can save you hundreds of clicks in a day when editing and managing your Grafana dashboards. It can also be used to store dashboards in a Github repo making Grafana dashboards version controlled.

* [Understanding the use case](#understanding-the-use-case)
* [Flow](#flow)
* [Getting started with wizzy](#getting-started-with-wizzy)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Initialization](#initialization)
* [Terminology](#terminology)
* [Commands](#commands)
* [Contributors](https://github.com/utkarshcmu/wizzy/graphs/contributors)
* [Project Initiator](#project-initiator)

# Understanding the use case

We want/need to edit and modify dashboards everyday and managing tens and hundreds of dashboard becomes hard for a Grafana user and as well as an administrator. To manage Grafana dashboards on command line makes it easier for the users who prefer keyboard over hundred of clicks. `wizzy` brings you that power to change dashboards on your command line. Together we can make it better and rich in terms of commands it support.

# Flow

1. A user makes a local directory to store dashboards and initialize it with Git version control.

2. Then the user imports and make a copy of the dashboard(s) in the local directory so that changes can be made on these imported dashboards.

3. The user uses `wizzy` cli tool to modify dashboard or dashboards and export it back to Grafana to replace the old one.

4. The user also can push it to a Git repo once he is done making changes to track what changed on a dashboard.

# Getting started with wizzy

## Prerequisites
Install nodejs by downloading it from nodejs.org. (https://nodejs.org/en/download/). After installing nodejs, run following commands:
```
$ node -v
$ npm -v
```
Note: Please make sure node version is above 5.10.1.

## Installation
There are 3 different ways you can install wizzy:

1 - Use docker image [wizzy-docker](https://github.com/utkarshcmu/wizzy-docker)
```
$ docker pull utkarshcmu/wizzy
	- pulls latest docker image
```
2 - Using npm (Stable release):
```
$ npm install -g wizzy
	- Use sudo if needed or permission was denied
```
3 - Using Github (from source):
```
$ git clone https://github.com/utkarshcmu/wizzy.git
$ cd wizzy
$ npm install
$ npm link
```

## Initialization
- Check wizzy version
```
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

# Terminology
- *local dashboard* - a json dashboard file under dashboards directory on local disk
- *remote dashboard* - a dashboard currently live in Grafana

# Commands
Broadly there are two types of commands in wizzy. Remote commands, which interacts with external sources like Grafana, S3, etc, and local commands, which operate on local json entities like dashboards, datasources, etc.

## Remote commands
These commands operates directly on remote dashboards in Grafana via API, so please use them carefully. Dashboard Context(which is explained next) is not supported by these commands currently as they will interact with Grafana API directly.

* [Dashboard commands](/docs/remote/dashboards.md)
* [Organization commands](/docs/remote/orgs.md)
* [Datasource commands](/docs/remote/datasources.md)

## Local commands
These commands operates on local json file based dashboards and support Dashboard Context.

* [Dashboard context](/docs/local/dashboard_context.md)
* [Dashboard commands](/docs/local/dashboards.md)
* [Organization commands](/docs/local/orgs.md)
* [Datasource commands](/docs/local/datasources.md)
* [Row commands](/docs/local/rows.md)
* [Panel commands](/docs/local/panels.md)
* [Template variable commands](/docs/local/template_variables.md)

## External commands
These commands interacts with external platforms such as Grafana.net, S3, etc.

* [S3 commands](/docs/remote/s3.md)
* [Grafana.net commands](/docs/remote/grafana_net.md)

## Other commands

* [Configuration commands](/docs/configuration.md)
* [Help commands](/docs/help.md)

# Project initiator
Utkarsh Bhatnagar, @utkarshcmu, <utkarsh.cmu@gmail.com>
