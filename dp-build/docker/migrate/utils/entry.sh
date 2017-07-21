#!/bin/sh
set -e

FLYWAY_ARGS="-configFile=$FLYWAY_SQL_DIR/flyway-docker.conf"

if [ -z $FLYWAY_URI ]; then
    FLYWAY_ARGS="$FLYWAY_ARGS -url=$FLYWAY_URI"
fi

if [ -z $FLYWAY_USER ]; then
    FLYWAY_ARGS="$FLYWAY_ARGS -user=$FLYWAY_USER"
fi

if [ -z $FLYWAY_PASS ]; then
    FLYWAY_ARGS="$FLYWAY_ARGS -password=$FLYWAY_PASS"
fi

flyway $FLYWAY_ARGS $@