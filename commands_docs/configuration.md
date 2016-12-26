## Configuration commands

wizzy properties can be set in wizzy by running following commands, if you have not set already:

```
$ wizzy set grafana url GRAFANA_URL

$ wizzy set grafana username USERNAME

$ wizzy set grafana password PASSWORD

$ wizzy set grafana debug_api true
	- an optional setting to debug Grafana API calls, `false` by default

$ wizzy set context dashboard DASHBOARD_SLUG

$ wizzy set clip render_height 600

$ wizzy set clip render_width 600

$ wizzy set clip render_timeout 10

$ wizzy set clip canvas_width 800

$ wizzy set clip canvas_height 600

$ wizzy set clip delay 500
	- sets delay between each snapshot, lower delay means short video

$ wizzy set s3 access_key

$ wizzy set s3 secret_key

$ wizzy set s3 bucket_name

$ wizzy set s3 path

$ wizzy set s3 region
```