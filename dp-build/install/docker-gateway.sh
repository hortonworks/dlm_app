#!/bin/sh
# dp-gateway:
#     image: hortonworks/dp-gateway
#     ports:
#       - "8762:8762"
#     volumes:
#       - ./certs:/usr/dp-app/conf/cert
#     environment:
#       CONSUL_HOST: ${CONSUL_HOST}
#     command: --knox.url=https://${KNOX_FQDN}:8443

docker start dp-gateway || \
    docker run \
        --name dp-gateway \
        --network=dp \
        --detach \
        --publish 8762:8762 \
        --env CONSUL_HOST \
        --mount type=bind,readonly=true,source=$(pwd)/certs,target=/usr/dp-app/conf/cert \
        hortonworks/dp-gateway \
        --knox.url=https://${KNOX_FQDN}:8443