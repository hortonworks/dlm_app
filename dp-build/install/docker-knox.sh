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
#   knox:
#     image: hortonworks/dp-knox
#     ports:
#     - "8443:8443"
#     environment:
#      - MASTER_PASSWORD
#      - USE_TEST_LDAP
#      - CONSUL_HOST
#     command: sh ./launch-knox.sh

docker start knox >> install.log 2>&1 || \
    docker run \
        --name knox \
        --network dp \
        --detach \
        --publish 8443:8443 \
        --env "CERTIFICATE_PASSWORD=$CERTIFICATE_PASSWORD" \
        --env "MASTER_PASSWORD=$MASTER_PASSWORD" \
        --env "USE_TEST_LDAP=$USE_TEST_LDAP" \
        --env "CONSUL_HOST=$CONSUL_HOST" \
        --volume knox-config:/etc/knox/conf \
        --volume $(pwd)/certs:/dp-shared \
        hortonworks/dp-knox:$VERSION
