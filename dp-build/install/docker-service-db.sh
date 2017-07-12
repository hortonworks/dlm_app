#!/bin/sh
# dp-db-service:
#     image: hortonworks/dp-db-service
#     depends_on:
#         - dp-database
#     links:
#         - dp-database
#     environment:
#         CONSUL_HOST: ${CONSUL_HOST}

docker start dp-db-service || \
    docker run \
        --name dp-db-service
        --network=dp \
        --detach \
        --env CONSUL_HOST \
        hortonworks/dp-db-service:0.0.1