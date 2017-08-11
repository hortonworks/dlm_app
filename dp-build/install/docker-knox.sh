#!/bin/sh
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
        --env "MASTER_PASSWORD=$MASTER_PASSWORD" \
        --env "USE_TEST_LDAP=$USE_TEST_LDAP" \
        --env "CONSUL_HOST=$CONSUL_HOST" \
        --volume $(pwd)/knox-config:/etc/knox/conf \
        hortonworks/dp-knox:$VERSION \
        sh ./launch-knox.sh
