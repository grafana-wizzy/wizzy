#!/bin/bash

rm -rf orgs
rm -rf datasources
wizzy show datasources
wizzy show datasource graphite
wizzy import datasource graphite
wizzy import datasources
wizzy export datasource graphite
wizzy export datasources
wizzy show org 1
wizzy show orgs
wizzy import org 1
wizzy import orgs
wizzy export org 2
wizzy create org ticku
wizzy delete org 4