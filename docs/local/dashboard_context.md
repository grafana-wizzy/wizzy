## Dashboard context

A user can set the dashboard context in wizzy by the following command so that the wizzy cli is aware about the local dashboard on which it should operate. This is an optional setting for some commands and mandatory for other commands, which makes wizzy cli more intuitive and user-friendly.

```
$ wizzy set context dashboard DASHBOARD_SLUG
```

Note: Once context is set, wizzy will use this dashboard as default if no dashboard is supplied. It will be mentioned in the documentation where setting dashboard context is required.
