#!/bin/sh
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

flyway $FLYWAY_ARGS $@