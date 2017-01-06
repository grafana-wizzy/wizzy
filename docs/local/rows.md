### Row commands

```
$ wizzy copy row SOURCE_ROW_NUMBER DESTINATION_ROW_NUMBER
	- copies a row from one position to another on the same dashboard

$ wizzy copy row SOURCE_ROW_NUMBER DESTINATION_DASHBOARD_SLUG.ROW_NUMBER
	- copies a row from one dashboard to another dashboard

$ wizzy move row SOURCE_ROW_NUMBER DESTINATION_ROW_NUMBER
	- moves a row from one position to another on the same dashboard

$ wizzy move row SOURCE_ROW_NUMBER DESTINATION_DASHBOARD_SLUG.ROW_NUMBER
	- moves a row from one dashboard to another dashboard

$ wizzy remove row SOURCE_ROW_NUMBER
	- removes a row from the current dashboard

$ wizzy extract row SOURCE_ROW_NUMBER
  - removes a row from the current dashboard and saves it under rows directory

$ wizzy insert row ROW_NAME
  - inserts a row from the rows directory to context dashboard

$ wizzy insert row ROW_NAME DESTINATION_SLUG
	- inserts a row from the rows directory to a dashboard
```