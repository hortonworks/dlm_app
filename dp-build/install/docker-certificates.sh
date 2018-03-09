#!/bin/bash

# for mount (new) >> --mount type=bind,readonly=true,source=$(pwd)/dbscripts,target=/dbscripts \

DP_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker run \
    --rm \
    --entrypoint /scripts/certs-generate.sh \
    --env "CERTIFICATE_PASSWORD=$CERTIFICATE_PASSWORD" \
    --volume "$DP_PATH"/certs:/dp-shared \
    hortonworks/dp-migrate:$VERSION
