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
echo "1st step"
if [ -z "$CONSUL_HOST" ]; then
    echo "Need to set CONSUL_HOST"
    exit 1
fi
echo "second step"
if [ ! -d ../data/security/master ]
then
    ./setup-master-password.sh
fi    
echo "Starting services ..."
ls -lR ../data/security/
./ldap.sh start
/usr/bin/java -Djava.library.path=/usr/hdp/current/knox-server/ext/native -jar /usr/hdp/current/knox-server/bin/gateway.jar &
consul agent -join $CONSUL_HOST -config-file=/consul-config/knox-consul.config -disable-host-node-id=true
