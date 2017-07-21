#!/bin/sh
set -e

FLYWAY_ARGS="-configFile=$FLYWAY_SQL_DIR/flyway-docker.conf"

if [ -n "$FLYWAY_URI" ]; then
    FLYWAY_ARGS="$FLYWAY_ARGS -url=$FLYWAY_URI"
fi

if [ -n "$FLYWAY_USER" ]; then
    FLYWAY_ARGS="$FLYWAY_ARGS -user=$FLYWAY_USER"
fi

if [ -n "$FLYWAY_PASS" ]; then
    FLYWAY_ARGS="$FLYWAY_ARGS -password=$FLYWAY_PASS"
fi

flyway $FLYWAY_ARGS $@