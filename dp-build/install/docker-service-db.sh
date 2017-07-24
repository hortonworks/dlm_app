#!/bin/sh
# dp-db-service:
#     image: hortonworks/dp-db-service
#     depends_on:
#         - dp-database
#     links:
#         - dp-database
#     environment:
#         CONSUL_HOST: ${CONSUL_HOST}

docker start dp-db-service >> install.log 2>&1 || \
    docker run \
        --name dp-db-service \
        --network dp \
        --detach \
        --env CONSUL_HOST \
        --env "DATABASE_URI=$DATABASE_URI" \
        --env "DATABASE_USER=$DATABASE_USER" \
        --env "DATABASE_PASS=$DATABASE_PASS" \
        hortonworks/dp-db-service:$VERSION
