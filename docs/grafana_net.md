## Grafana.net Commands

wizzy can interact now with Grafana.net. It can list and download dashboards from Grafana.net. Commands available for interaction with Grafana.net are listed below:
```
$ wizzy list gnet dashboards <FILTER>
  - lists all the dashboards and if filter is present then filters out the dashboards according to it.
  - for example: 'wizzy list gnet dashboards ds=graphite' lists all dashboards with datasource = graphite.
  
$ wizzy download gnet dashboard DASHBOARD_ID REVISION_ID
  - Download a dashboard json from Grafana.net and stores under dashboards directory.
```
