#!/bin/sh

printf "Waiting for cert file"
while [ ! -f /usr/hdp/current/knox-server/data/security/keystores/gateway.jks ];
do
	printf "%s" "."
	sleep 1;
done
echo ""