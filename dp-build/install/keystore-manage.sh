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
DP_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

update_call() {
    local ALIAS="$1"

    docker run \
        --rm \
        --entrypoint /scripts/keystore-update.sh \
        --env "MASTER_PASSWORD=$MASTER_PASSWORD" \
        --volume "$DP_PATH"/certs:/dp-shared \
        hortonworks/dp-migrate:$VERSION update "$@"

    echo "'$ALIAS' updated successfully"
}

update_secrets() {
    local ALIAS_KEY="$1"

    if [ "$ALIAS_KEY" == "ambari" ] || [ "$ALIAS_KEY" == "--all" ]; then
        if [ -z "$AMBARI_USERNAME" ] || [ -z "$AMBARI_PASSWORD" ]; then
            read -p "Please enter Ambari username:" AMBARI_USERNAME
            echo
            read -s -p "Please enter Ambari password:" AMBARI_PASSWORD
            echo
        fi
        local AMBARI_ALIAS="DPSPlatform.credential.ambari"
        update_call "$AMBARI_ALIAS" "$AMBARI_USERNAME" "$AMBARI_PASSWORD"
    fi

    if [ "$ALIAS_KEY" == "atlas" ] || [ "$ALIAS_KEY" == "--all" ]; then
        if [ -z "$ATLAS_USERNAME" ] || [ -z "$ATLAS_PASSWORD" ]; then
            read -p "Please enter Atlas username:" ATLAS_USERNAME
            echo
            read -s -p "Please enter Atlas password:" ATLAS_PASSWORD
            echo
        fi
        local ATLAS_ALIAS="DPSPlatform.credential.atlas"
        update_call "$ATLAS_ALIAS" "$ATLAS_USERNAME" "$ATLAS_PASSWORD"
    fi

    if [ "$ALIAS_KEY" == "ranger" ] || [ "$ALIAS_KEY" == "--all" ]; then
        if [ -z "$RANGER_USERNAME" ] || [ -z "$RANGER_PASSWORD" ]; then
            read -p "Please enter Ranger username:" RANGER_USERNAME
            echo
            read -s -p "Please enter Ranger password:" RANGER_PASSWORD
            echo
        fi
        local RANGER_ALIAS="DPSPlatform.credential.ranger"
        update_call "$RANGER_ALIAS" "$RANGER_USERNAME" "$RANGER_PASSWORD"
    fi
}

main() {
    update_secrets "$@"
}

main "$@"
