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

init_keystore() {
    echo "dummy" | \
        keytool \
            -importpass \
            -storetype jceks \
            -keystore /dp-shared/dp-keystore.jceks \
            -storepass "$MASTER_PASSWORD" \
            -alias "dummy" \
            -keypass "dummy" &> /dev/null && echo "Keystore bootstrapped."

    # fix permissions
    chmod 600 /dp-shared/dp-keystore.jceks
}

remove_credential() {
    local ALIAS="$1"

    keytool \
        -delete \
        -storepass "$MASTER_PASSWORD" \
        -storetype jceks \
        -alias "$ALIAS.username" \
        -keystore /dp-shared/dp-keystore.jceks &> /dev/null || echo -n ""

    keytool \
        -delete \
        -storepass "$MASTER_PASSWORD" \
        -storetype jceks \
        -alias "$ALIAS.password" \
        -keystore /dp-shared/dp-keystore.jceks &> /dev/null || echo -n ""
}

add_credential() {
    local ALIAS="$1"
    local USERNAME="$2"
    local PASSWORD="$3"

    echo "$USERNAME" | \
        keytool \
            -importpass \
            -storetype jceks \
            -keystore /dp-shared/dp-keystore.jceks \
            -storepass "$MASTER_PASSWORD" \
            -alias "$ALIAS.username" \
            -keypass "$MASTER_PASSWORD"
        
    echo "$PASSWORD" | \
        keytool \
            -importpass \
            -storetype jceks \
            -keystore /dp-shared/dp-keystore.jceks \
            -storepass "$MASTER_PASSWORD" \
            -alias "$ALIAS.password" \
            -keypass "$MASTER_PASSWORD"
}

update_credential() {
    local ALIAS="$1"
    local USERNAME="$2"
    local PASSWORD="$3"

    if [ ! -e /dp-shared/dp-keystore.jceks ]; then
        echo "Initializing keystore..."
        init_keystore
    fi

    remove_credential "$ALIAS"
    add_credential "$ALIAS" "$USERNAME" "$PASSWORD"
}

main() {
    local COMMAND="$1"
    if [[ $# -eq 4 && "$COMMAND" == "update" ]]; then
        shift
        update_credential "$@"
    elif [[ $# -eq 1 && "$COMMAND" == "init" ]]; then
        if [ ! -e /dp-shared/dp-keystore.jceks ]; then
            echo "Initializing keystore..."
            init_keystore
        fi
    else
        echo "Invalid arguments."
        echo "Usage: init | update <alias> <username> <password>"
        return -1
    fi
}

main "$@"
