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
        -Dconsul.host=${CONSUL_HOST} $DATABASE_ARGS "$@"
