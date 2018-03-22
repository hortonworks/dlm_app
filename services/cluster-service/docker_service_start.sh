#!/bin/sh
if [ -z "$CONSUL_HOST" ]; then
    echo "Need to set CONSUL_HOST"
    exit 1
fi

/usr/dp-cluster-service/bin/cluster-service \
    -Ddp.services.db.service.uri=http://dp-db-service:9000 \
    -Dconsul.host=${CONSUL_HOST} \
    -Ddp.services.hdp_proxy.consul.host=${CONSUL_HOST} \
    -Ddp.keystore.path=${KEYSTORE_PATH} \
    -Ddp.keystore.password=${KEYSTORE_PASSWORD} \
    -Ddp.service.ambari.single.node.cluster=${SINGLE_NODE_CLUSTER} \
    -Djsse.enableSNIExtension=false \
    "$@"