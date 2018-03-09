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

# dp-app:
#     image: hortonworks/dp-app
#     ports:
#         - "80:80"
#         - required > in dockerfile
#     volumes:
#         - ./certs:/usr/dp-app/conf/cert
#     environment:
#         DP_APP_HOME: "/usr/dp-app"
#         CONSUL_HOST: ${CONSUL_HOST}

# for mount (new) >> --mount type=bind,readonly=false,source=$(pwd)/certs,target=/usr/dp-app/conf/cert \

DP_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker start dp-app >> "$DP_PATH"/install.log 2>&1 || \
    docker run \
        --name dp-app \
        --network dp \
        --detach \
        --publish 80:80 \
        --publish 443:443 \
        --env "CERTIFICATE_PASSWORD=$CERTIFICATE_PASSWORD" \
        --env "CONSUL_HOST=$CONSUL_HOST" \
        --env "KEYSTORE_PATH=/dp-shared/dp-keystore.jceks" \
        --env "KEYSTORE_PASSWORD=$MASTER_PASSWORD" \
        --env "USE_TLS=$USE_TLS" \
        --volume "$DP_PATH"/certs:/dp-shared \
        hortonworks/dp-app:$VERSION
