#!/bin/sh
if [ -z "$CONSUL_HOST" ]; then
    echo "Need to set CONSUL_HOST"
    exit 1
fi  

rm -f /usr/dp-db-service/RUNNING_PID && /usr/dp-db-service/bin/db-service -Dconfig.resource=application.docker.conf -Dplay.crypto.secret=20390398 -Dconsul.host=${CONSUL_HOST}
