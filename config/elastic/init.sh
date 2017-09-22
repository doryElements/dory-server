#!/bin/bash

curl -XPUT 'http://localhost:9200/_template/jwt_kills' -d @jwt-kill_template.json

# Register Backup
curl -XPUT 'http://localhost:9200/_snapshot/dory_backup' -d @dory_backup.json