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

update_call() {
    local ALIAS="$1"

    docker run \
        --rm \
        --entrypoint /scripts/keystore-update.sh \
        --env "MASTER_PASSWORD=$MASTER_PASSWORD" \
        --volume $(pwd)/certs:/dp-shared \
        hortonworks/dp-migrate:$VERSION update "$@"

    echo "'$ALIAS' updated successfully"
}

update_secrets() {
    local ALIAS_KEY="$1"

    if [ "$ALIAS_KEY" == "ambari" ] || [ "$ALIAS_KEY" == "--all" ]; then
        if [ -z "$AMBARI_USERNAME" ] || [ -z "$AMBARI_PASSWORD" ]; then
            echo "Please enter Ambari username:"
            read AMBARI_USERNAME
            echo "Please enter Ambari password:"
            read -s AMBARI_PASSWORD
        fi
        local AMBARI_ALIAS="dp.credential.ambari"
        update_call "$AMBARI_ALIAS" "$AMBARI_USERNAME" "$AMBARI_PASSWORD"
    fi

    if [ "$ALIAS_KEY" == "atlas" ] || [ "$ALIAS_KEY" == "--all" ]; then
        if [ -z "$ATLAS_USERNAME" ] || [ -z "$ATLAS_PASSWORD" ]; then
            echo "Please enter Atlas username:"
            read ATLAS_USERNAME
            echo "Please enter Atlas password:"
            read -s ATLAS_PASSWORD
        fi
        local ATLAS_ALIAS="dp.credential.atlas"
        update_call "$ATLAS_ALIAS" "$ATLAS_USERNAME" "$ATLAS_PASSWORD"
    fi

    if [ "$ALIAS_KEY" == "ranger" ] || [ "$ALIAS_KEY" == "--all" ]; then
        if [ -z "$RANGER_USERNAME" ] || [ -z "$RANGER_PASSWORD" ]; then
            echo "Please enter Ranger username:"
            read RANGER_USERNAME
            echo "Please enter Ranger password:"
            read -s RANGER_PASSWORD
        fi
        local RANGER_ALIAS="dp.credential.ranger"
        update_call "$RANGER_ALIAS" "$RANGER_USERNAME" "$RANGER_PASSWORD"
    fi
}

main() {
    update_secrets "$@"
}

main "$@"
