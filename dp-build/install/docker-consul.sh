#!/bin/sh
# dp-consul-server:
#     image: consul
#     network_mode: "host"
#     command: agent -server -bootstrap -bind=${CONSUL_HOST} -client=${CONSUL_HOST} -ui
#     command: agent -server -ui -bind=172.19.0.2 -client=172.19.0.2 -bootstrap-expect=1

docker start dp-consul-server || \
    docker run \
        --name dp-consul-server \
        --network=host \
        --detach \
        consul:0.8.5 \
        agent -server -ui -bootstrap-expect=1 -bind=${CONSUL_HOST} -client=${CONSUL_HOST}
