#!/bin/bash

curl -XPUT 'http://localhost:9200/_snapshot/dory_backup' -d @dory_backup.json