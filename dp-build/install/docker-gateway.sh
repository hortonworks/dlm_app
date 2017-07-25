#!/bin/sh
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

docker start dp-gateway >> install.log 2>&1 || \
    docker run \
        --name dp-gateway \
        --network dp \
        --detach \
        --publish 8762:8762 \
        --env CONSUL_HOST \
        --volume $(pwd)/certs:/usr/dp-app/conf/cert \
        hortonworks/dp-gateway:$VERSION \
        --knox.url=https://${KNOX_FQDN}:8443