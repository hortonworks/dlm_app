#!/bin/bash
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
set -e

init_call() {
    docker run \
        --rm \
        --entrypoint /scripts/keystore-update.sh \
        --env "MASTER_PASSWORD=$MASTER_PASSWORD" \
        --volume $(pwd)/certs:/dp-shared \
        hortonworks/dp-migrate:$VERSION init

    echo "Keystore initialized successfully"
}

main() {
    init_call
}

main "$@"
