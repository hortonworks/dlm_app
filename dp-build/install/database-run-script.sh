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


run_db_command() {
    ENTRY_POINT=$1
    shift
    docker run \
            --network dp \
            --rm \
            --entrypoint ${ENTRY_POINT} \
            --env "PGHOST=$DB_HOST" \
            --env "PGPORT=$DB_PORT" \
            --env "PGUSER=$DB_USER" \
            --env "PGPASSWORD=$DB_PASS" \
            --env "PGDATABASE=$DB_NAME" \
            hortonworks/dp-migrate:$VERSION "$@"
}

update_admin_password(){
    run_db_command /scripts/user-update.sh "$@"
}

update_config(){
    run_db_command /scripts/config-update.sh "$@"
}

get_config(){
    run_db_command /scripts/config-get.sh "$@"
}

main() {

    # initialize with defaults
    DB_NAME="dataplane"
    DB_HOST="$DB_CONTAINER"
    DB_PORT="5432"
    DB_USER="dp_admin"
    DB_PASS="dp_admin"

    # update if required
    if [ "$USE_EXT_DB" == "yes" ]; then
        local T_SOCKET=$(echo $DATABASE_URI | awk -F/ '{print $3}')
        DB_NAME=$(echo $DATABASE_URI | awk -F/ '{print $4}')
        DB_HOST=$(echo $T_SOCKET | awk -F: '{print $1}')
        DB_PORT=$(echo $T_SOCKET | awk -F: '{print $2}')
        if [ -z "$DB_PORT" ]; then
            DB_PORT="80"
        fi
        DB_USER="$DATABASE_USER"
        DB_PASS="$DATABASE_PASS"
    fi

    if [ "$#" -lt 1 ]; then
        echo "Error: Could not find a database command to execute."
    fi

    DB_CMD=$1
    case ${DB_CMD} in
        UPDATE_ADMIN_PASSWORD)
            shift
            update_admin_password "$@"
            ;;
        ENABLE_CONFIG|DISABLE_CONFIG)
            update_config "$@"
            ;;
        GET_CONFIG)
            get_config "$@"
            ;;
        *)
            echo "Error: Invalid database command $DB_CMD."
            ;;
    esac
}

main "$@"
