#!/bin/sh
# dp-consul-server:
#     image: consul
#     network_mode: "host"
#     command: agent -server -bootstrap -bind=${CONSUL_HOST} -client=${CONSUL_HOST} -ui

docker start dp-consul-server || \
    docker run \
        --name dp-consul-server \
        --network=dp \
        --detach \
        consul:0.8.5 \
        agent -server -bootstrap-expect=1 -bind=${CONSUL_HOST} -client=${CONSUL_HOST} -ui