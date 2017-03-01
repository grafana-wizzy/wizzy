#!/bin/sh
for file in datasources/*
do
  tempfile=`echo "${file}" | cut -d "/" -f2- `
  echo "${tempfile} being exported" 
  wizzy export datasource  "${tempfile%.json}" >> results.out
done
