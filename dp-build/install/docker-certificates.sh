#!/bin/bash

# for mount (new) >> --mount type=bind,readonly=true,source=$(pwd)/dbscripts,target=/dbscripts \

docker run \
    --rm \
    --interactive \
    --tty \
    --entrypoint /scripts/certs-generate.sh \
    --env "CERTIFICATE_PASSWORD=$CERTIFICATE_PASSWORD" \
    --volume $(pwd)/certs:/dp-shared \
    hortonworks/dp-migrate:$VERSION
