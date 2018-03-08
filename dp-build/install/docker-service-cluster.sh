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
# dp-cluster-service:
#     image: hortonworks/dp-cluster-service
#     depends_on:
#         - dp-database
#     links:
#         - dp-database
#     environment:
#     CONSUL_HOST: ${CONSUL_HOST}

DP_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker start dp-cluster-service >> "$DP_PATH"/install.log 2>&1 || \
    docker run \
        --name dp-cluster-service \
        --network dp \
        --detach \
        --env "CONSUL_HOST=$CONSUL_HOST" \
        --env "KEYSTORE_PATH=/dp-shared/dp-keystore.jceks" \
        --env "KEYSTORE_PASSWORD=$MASTER_PASSWORD" \
        --env "SINGLE_NODE_CLUSTER=$SINGLE_NODE_CLUSTER" \
        --volume "$DP_PATH"/certs:/dp-shared \
        hortonworks/dp-cluster-service:$VERSION
