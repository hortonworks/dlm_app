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
# dp-consul-server:
#     image: consul
#     network_mode: "host"
#     command: agent -server -bootstrap -bind=${CONSUL_HOST} -client=${CONSUL_HOST} -ui
#     command: agent -server -ui -bind=172.19.0.2 -client=172.19.0.2 -bootstrap-expect=1

docker start dp-vault-server >> install.log 2>&1 || \
    docker run \
        --name dp-vault-server \
        --network dp \
        --detach \
        --publish 8200:8200 \
        --cap-add=IPC_LOCK -e 'VAULT_LOCAL_CONFIG={
              "backend":{
                "file": {"path": "/vault/file"}
              },
              "listener":{
                "tcp":{
                  "address":"0.0.0.0:8200",
                  "tls_disable":1
                }
              }
         }' \
        -e VAULT_ADDR='http://127.0.0.1:8200' \
        vault server

