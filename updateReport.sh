#!/bin/bash
thisYear=$(date +%Y)
thisMonth=$(date +%m)
yestoday=$(date -v-1d +%d)
echo '----- step 1: query data -----'
node ./main.js
echo '----- done -----'
echo '\n'
echo '----- step 2: process data -----'
node ./process.js ${thisYear}${thisMonth}
echo '----- done -----'
echo '\n'
echo '----- step 3: upload -----'
git add dataSource
git commit -m ${thisMonth}${yestoday}
git push
echo ${thisMonth}${yestoday}-report done.
