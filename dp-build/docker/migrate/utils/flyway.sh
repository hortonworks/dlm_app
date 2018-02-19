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

FLYWAY_ARGS="-configFile=$FLYWAY_SQL_DIR/flyway-docker.conf"

if [ -n "$DATABASE_URI" ]; then
    FLYWAY_ARGS="$FLYWAY_ARGS -url=$DATABASE_URI"
fi

if [ -n "$DATABASE_USER" ]; then
    FLYWAY_ARGS="$FLYWAY_ARGS -user=$DATABASE_USER"
fi

if [ -n "$DATABASE_PASS" ]; then
    FLYWAY_ARGS="$FLYWAY_ARGS -password=$DATABASE_PASS"
fi

flyway $FLYWAY_ARGS "$@"

if [[ "$@" = *"migrate"* ]]; then
     # initialize with defaults
    DB_NAME="dataplane"
    DB_HOST="dp-database"
    DB_PORT="5432"
    DB_USER="dp_admin"
    DB_PASS="dp_admin"

    # update if required
    if [ -n "$DATABASE_URI" ]; then
        local T_SOCKET=$(echo $DATABASE_URI | awk -F/ '{print $3}')
        DB_NAME=$(echo $DATABASE_URI | awk -F/ '{print $4}')
        DB_HOST=$(echo $T_SOCKET | awk -F: '{print $1}')
        DB_PORT=$(echo $T_SOCKET | awk -F: '{print $2}')
        if [ -z "$DB_PORT" ]; then
            DB_PORT="80"
        fi
    fi

    if [ -n "$DATABASE_USER" ]; then
        DB_USER="$DATABASE_USER"
    fi

    if [ -n "$DATABASE_PASS" ]; then
        DB_PASS="$DATABASE_PASS"
    fi
    local UPDATE_QUERY="UPDATE dataplane.configs SET config_value = '$GA_TRACKING_ID', active = true WHERE config_key = 'dps.ga.tracking.id'"
    psql -c "$UPDATE_QUERY"
fi
