#!/bin/sh

printf "Waiting for cert file"
while [ ! -f /var/lib/knox/${KNOX_VERSION}/security/keystores/gateway.jks ];
do
	printf "%s" "."
	sleep 1;
done
echo ""