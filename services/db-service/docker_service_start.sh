#!/bin/sh
if [ -z "$CONSUL_HOST" ]; then
    echo "Need to set CONSUL_HOST"
    exit 1
fi


DATABASE_ARGS=""
if [ -n "$DATABASE_URI" ]; then
    DATABASE_ARGS="$DATABASE_ARGS -Dslick.dbs.default.db.url=$DATABASE_URI"
fi

if [ -n "$DATABASE_USER" ]; then
    DATABASE_ARGS="$DATABASE_ARGS -Dslick.dbs.default.db.user=$DATABASE_USER"
fi

if [ -n "$DATABASE_PASS" ]; then
    DATABASE_ARGS="$DATABASE_ARGS -Dslick.dbs.default.db.password=$DATABASE_PASS"
fi

rm -f /usr/dp-db-service/RUNNING_PID && \
    /usr/dp-db-service/bin/db-service \
        -Dconfig.resource=application.docker.conf \
        -Dplay.crypto.secret=20390398 \
        -Dconsul.host=${CONSUL_HOST} $DATABASE_ARGS
