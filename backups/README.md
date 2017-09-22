Elasticsearch config
=====================

## Snapshot & Backup
Doc: https://www.elastic.co/guide/en/elasticsearch/reference/2.4/modules-snapshots.html
TODO: https://www.elastic.co/guide/en/elasticsearch/reference/5.0/indices-rollover-index.html

Need Config in elasticsearch.yml

### Snapshot
```bash
curl -XPUT http://localhost:9200/_snapshot/dory_backup/snapshot_1?wait_for_completion=true
```

### Restore
```bash
curl -XPOST http://localhost:9200/_snapshot/dory_backup/snapshot_1/_restore
```
