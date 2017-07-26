#!/bin/sh
set -e

FLYWAY_ARGS="-configFile=$FLYWAY_SQL_DIR/flyway-docker.conf"

flyway $FLYWAY_ARGS $@