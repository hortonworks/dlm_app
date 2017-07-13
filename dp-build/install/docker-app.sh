#!/bin/sh
# dp-app:
#     image: hortonworks/dp-app
#     ports:
#         - "80:80"
#         - required > in dockerfile
#     volumes:
#         - ./certs:/usr/dp-app/conf/cert
#     environment:
#         DP_APP_HOME: "/usr/dp-app"
#         CONSUL_HOST: ${CONSUL_HOST}

docker start dp-app >> install.log 2>&1 || \
    docker run \
        --name dp-app \
        --network=dp \
        --detach \
        --publish 80:80 \
        --env CONSUL_HOST \
        --env DP_APP_HOME=/usr/dp-app \
        --mount type=bind,readonly=true,source=$(pwd)/certs,target=/usr/dp-app/conf/cert \
        hortonworks/dp-app:$VERSION
