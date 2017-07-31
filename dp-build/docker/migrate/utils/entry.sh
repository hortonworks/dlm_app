#!/bin/sh
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