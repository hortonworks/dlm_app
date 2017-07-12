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

docker start knox || \
    docker run \
        –-name knox \
        --network=dp \
        --detach \
        --publish 8443:8443 \
        --env MASTER_PASSWORD \
        --env USE_TEST_LDAP \
        --env CONSUL_HOST \
        hortonworks/dp-knox \
        sh ./launch-knox.sh
