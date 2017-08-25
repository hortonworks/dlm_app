#!/bin/sh
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
/usr/bin/java -Djava.library.path=/usr/hdp/2.6.0.3-8/knox/ext/native -jar /usr/hdp/2.6.0.3-8/knox/bin/gateway.jar &
consul agent -join $CONSUL_HOST -config-file=/consul-config/knox-consul.config -disable-host-node-id=true
