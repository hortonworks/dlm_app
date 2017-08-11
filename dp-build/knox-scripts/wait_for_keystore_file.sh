#!/bin/sh

printf "Waiting for cert file"
while [ ! -f /var/lib/knox/data-2.6.0.3-8/security/keystores/gateway.jks ];
do
	printf "%s" "."
	sleep 1;
done
echo ""