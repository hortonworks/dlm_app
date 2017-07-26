#!/bin/sh
# version: '2'
# services:
#   dp-migrate:
#     image: claycephas/flyway
#     volumes: 
#         - ./dbscripts:/dbscripts
#     depends_on: 
#         - dp-database
#     links:
#         - dp-database
#     command: -configFile=/dbscripts/flyway-docker.conf clean migrate

# for mount (new) >> --mount type=bind,readonly=true,source=$(pwd)/dbscripts,target=/dbscripts \

docker start dp-migrate >> install.log 2>&1 || \
    docker run \
        --name dp-migrate \
        --network dp \
        --rm \
        hortonworks/dp-migrate:$VERSION \
        clean migrate
