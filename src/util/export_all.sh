#!/bin/sh
for file in dashboards/*
do
  tempfile=`echo "${file}" | cut -d "/" -f2- `
  echo "${tempfile} being imported" 
  wizzy export new-dashboard  "${tempfile%.json}" >> results.out
done
