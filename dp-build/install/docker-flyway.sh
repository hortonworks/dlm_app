#!/bin/sh
#
# /*
#  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
#  *
#  * Except as expressly permitted in a written agreement between you or your company
#  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
#  * reproduction, modification, redistribution, sharing, lending or other exploitation
#  * of all or any part of the contents of this software is strictly prohibited.
#  */
#
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

DP_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker start dp-migrate >> "$DP_PATH"/install.log 2>&1 || \
    docker run \
        --name dp-migrate \
        --network dp \
        --rm \
        --entrypoint /scripts/flyway.sh \
        --env "DATABASE_URI=$DATABASE_URI" \
        --env "DATABASE_USER=$DATABASE_USER" \
        --env "DATABASE_PASS=$DATABASE_PASS" \
        hortonworks/dp-migrate:$VERSION $@
