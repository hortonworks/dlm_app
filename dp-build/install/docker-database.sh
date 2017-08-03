#!/bin/sh
# version: '2'
# services:
#   dp-database:
#     image: postgres
#     environment:
#       POSTGRES_PASSWORD: dp_admin
#       POSTGRES_USER: dp_admin
#       POSTGRES_DB: dataplane

docker start dp-database >> install.log 2>&1 || \
    docker run \
        --name dp-database \
        --network dp \
        --detach \
        --env "POSTGRES_PASSWORD=dp_admin" \
        --env "POSTGRES_USER=dp_admin" \
        --env "POSTGRES_DB=dataplane" \
        postgres:9.6.3-alpine 
