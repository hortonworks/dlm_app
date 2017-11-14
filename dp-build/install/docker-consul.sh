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

docker start dp-consul-server >> install.log 2>&1 || \
    docker run \
        --name dp-consul-server \
        --network dp \
        --detach \
        --publish 8500:8500 \
        consul:0.8.5 \
        agent -server -ui -bootstrap -bind=0.0.0.0 -client=0.0.0.0 -data-dir=/consul/data -disable-host-node-id
