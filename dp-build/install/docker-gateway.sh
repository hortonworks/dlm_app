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
# dp-gateway:
#     image: hortonworks/dp-gateway
#     ports:
#       - "8762:8762"
#       - not required > in dockerfile
#     volumes:
#       - ./certs:/usr/dp-app/conf/cert
#     environment:
#       CONSUL_HOST: ${CONSUL_HOST}
#     command: --knox.url=https://${KNOX_FQDN}:8443

# mount (new) --mount type=bind,readonly=false,source=$(pwd)/certs,target=/usr/dp-app/conf/cert \

DP_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker start dp-gateway >> "$DP_PATH"/install.log 2>&1 || \
    docker run \
        --name dp-gateway \
        --network dp \
        --detach \
        --env "CONSUL_HOST=$CONSUL_HOST" \
        --env "CERTIFICATE_PASSWORD=$CERTIFICATE_PASSWORD" \
        --volume "$DP_PATH"/certs:/dp-shared \
        hortonworks/dp-gateway:$VERSION
