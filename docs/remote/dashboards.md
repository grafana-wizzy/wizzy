### Dashboard commands

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

$ wizzy delete dashboard DASHBOARD_SLUG
	- deletes a remote dashboard from Grafana

$ wizzy clip dashboard DASHBOARD_SLUG
	- makes a clip (gif) of dashboard's last 24 hours of data
	- Note: Pleas set all 6 clip configuration properties otherwise this command will not work
	- See at the bottom of the page to set clip configuration properties
```