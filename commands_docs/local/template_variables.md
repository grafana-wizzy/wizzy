### Template variable commands

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