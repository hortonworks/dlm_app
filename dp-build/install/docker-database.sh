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
#   dp-database:
#     image: postgres
#     environment:
#       POSTGRES_PASSWORD: dp_admin
#       POSTGRES_USER: dp_admin
#       POSTGRES_DB: dataplane
DP_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker start dp-database >> "$DP_PATH"/install.log 2>&1 || \
    docker run \
        --name dp-database \
        --network dp \
        --detach \
        --env "POSTGRES_PASSWORD=dp_admin" \
        --env "POSTGRES_USER=dp_admin" \
        --env "POSTGRES_DB=dataplane" \
        --volume postgresql-data:/var/lib/postgresql/data \
        postgres:9.6.3-alpine
