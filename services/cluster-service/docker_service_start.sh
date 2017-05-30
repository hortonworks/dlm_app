#!/bin/sh
if [ -z "$CONSUL_HOST" ]; then
    echo "Need to set CONSUL_HOST"
    exit 1
fi

/usr/dp-cluster-service/bin/cluster-service -Ddp.services.db.service.uri=http://dp-db-service:9000 -Dconsul.host=${CONSUL_HOST}