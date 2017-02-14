#!/bin/sh
for file in dashboards/*
do
  tempfile=`echo "${file}" | cut -d "/" -f2- `
  echo "${tempfile} being exported" 
  wizzy export dashboard  "${tempfile%.json}" >> results.out
done
