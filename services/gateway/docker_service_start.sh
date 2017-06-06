#!/bin/sh
if [ -z "$CONSUL_HOST" ]; then
    echo "Need to set CONSUL_HOST"
    exit 1
fi

java -jar /usr/gateway-service/gateway-1.0.jar --spring.cloud.consul.host=$CONSUL_HOST --sso.enabled=true --signing.pub.key.path=/usr/dp-app/conf/cert/knox-signing.pem
