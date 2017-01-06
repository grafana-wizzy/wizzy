### Panel commands

```
$ wizzy copy panel SOURCE_ROW.PANEL_NUMBER DESTINATION_ROW_NUMBER.PANEL_NUMBER
	- copies a panel from current row to another row on the same dashboard

$ wizzy copy panel SOURCE_ROW.PANEL_NUMBER DESTINATION_DASHBOARD_SLUG.ROW_NUMBER.PANEL_NUMBER
	- copies a panel from current dashboard to another dashboard

$ wizzy move panel SOURCE_ROW.PANEL_NUMBER DESTINATION_ROW_NUMBER.PANEL_NUMBER
	- moves a panel from current row to another row on the same dashboard

$ wizzy move panel SOURCE_ROW.PANEL_NUMBER DESTINATION_DASHBOARD_SLUG.ROW_NUMBER.PANEL_NUMBER
	- moves a panel from current dashboard to another dashboard

$ wizzy remove panel SOURCE_ROW.PANEL_NUMBER
	- removes a panel from current dashboard

$ wizzy extract panel SOURCE_ROW_NUMBER.PANEL_NUMBER PANEL_NAME
  - removes a panel from the current dashboard and saves it under panels directory

$ wizzy insert panel PANEL_NAME ROW_NUMBER
  - inserts a panel from the panels directory to a row in context dashboard

$ wizzy insert panel ROW_NAME DESTINATION_SLUG.ROW_NUMBER
	- inserts a panel from the panels directory to a row in a dashboard
```