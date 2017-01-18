#!bin/bash

rm -rf panels
rm -rf rows
rm -rf temp-vars
rm -rf dash-tags
wizzy set context dashboard dashboard-1
wizzy conf
wizzy summarize dashboard
wizzy summarize dashboard dashboard-2
wizzy change panels datasource graphite graphite2
wizzy summarize dashboard
wizzy copy row 1 2
wizzy copy row 1 dashboard-2.2
wizzy summarize dashboard dashboard-2
wizzy remove row 2
wizzy summarize dashboard
wizzy extract row 1 row-1
wizzy insert row row-1 dashboard-3