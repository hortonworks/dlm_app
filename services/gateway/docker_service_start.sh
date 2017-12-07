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

java  \
    -jar /usr/gateway-service/gateway-1.0.jar \
        --spring.cloud.consul.host="$CONSUL_HOST" \
        --sso.enabled=true \
        --signing.pub.key.path=/dp-shared/ssl-cert.pem "$@"
