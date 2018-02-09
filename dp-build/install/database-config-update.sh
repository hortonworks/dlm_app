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

main() {

    # initialize with defaults
    local DB_NAME="dataplane"		
    local DB_HOST="$DB_CONTAINER"		
    local DB_PORT="5432"		
    local DB_USER="dp_admin"		
    local DB_PASS="dp_admin"	

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
    
    docker run \
        --network dp \
        --rm \
        --entrypoint /scripts/config-update.sh \
        --env "PGHOST=$DB_HOST" \
        --env "PGPORT=$DB_PORT" \
        --env "PGUSER=$DB_USER" \
        --env "PGPASSWORD=$DB_PASS" \
        --env "PGDATABASE=$DB_NAME" \
        hortonworks/dp-migrate:$VERSION "$@"
}

main "$@"
