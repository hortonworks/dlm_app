#!/bin/sh
# dp-cluster-service:
#     image: hortonworks/dp-cluster-service
#     depends_on:
#         - dp-database
#     links:
#         - dp-database
#     environment:
#     CONSUL_HOST: ${CONSUL_HOST}

docker start dp-cluster-service >> install.log 2>&1 || \
    docker run \
        --name dp-cluster-service \
        --network dp \
        --detach \
        --env "CONSUL_HOST=$CONSUL_HOST" \
        hortonworks/dp-cluster-service:$VERSION
