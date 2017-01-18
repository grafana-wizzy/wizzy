#!/bin/bash

wizzy set clip render_height 600
wizzy set clip render_width 800
wizzy set clip render_timeout 60
wizzy set clip canvas_height 600
wizzy set clip canvas_width 800
wizzy set clip delay 2000
wizzy conf
#wizzy clip dashboard dashboard-1
rm -rf temp
wizzy clip dashboards-by-tag micku
rm -rf temp
wizzy create dash-list new-list-1
wizzy add to-dash-list new-list-1 dashboard-1
wizzy add to-dash-list new-list-1 dashboard-2
wizzy add to-dash-list new-list-1 dashboard-3
wizzy clip dash-list new-list-1
rm -rf temp