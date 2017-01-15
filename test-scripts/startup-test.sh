#!/bin/sh
rm -rf conf
wizzy init
wizzy init
wizzy set grafana url http://localhost:3000
wizzy set grafana username admin
wizzy set grafana password admin
wizzy status
wizzy conf
wizzy help