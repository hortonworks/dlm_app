#!/bin/bash
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
set -e

KNOX_HOME=/usr/hdp/current/knox-server

echo "1st step"
if [ -z "$CONSUL_HOST" ]; then
    echo "Need to set CONSUL_HOST"
    exit 1
fi

echo "Starting Consul"
consul agent \
    -join $CONSUL_HOST \
    -config-file=/scripts/knox-consul.config \
    -disable-host-node-id=true &
        
if [ ! -d $KNOX_HOME/data/security/master ]; then
    # if already set, do not reset
    echo "Setting up master passsword"
    $KNOX_HOME/bin/knoxcli.sh create-master --force --master $MASTER_PASSWORD
    chown knox $KNOX_HOME/data/security/master
fi

echo "Convert keys for use by keytool"
openssl pkcs12 \
    -export \
    -in /dp-shared/ssl-cert.pem \
    -inkey /dp-shared/ssl-key.pem \
    -passin pass:"$CERTIFICATE_PASSWORD" \
    -out temp_cert_chain.p12 \
    -name gateway-identity \
    -passout pass:"$MASTER_PASSWORD"

echo "Generating Knox keystore"
keytool \
    -importkeystore \
    -srckeystore temp_cert_chain.p12 \
    -srcstoretype pkcs12 \
    -srcstorepass $MASTER_PASSWORD \
    -destkeystore $KNOX_HOME/data/security/keystores/gateway.jks \
    -deststoretype jks \
    -deststorepass $MASTER_PASSWORD \
    -alias gateway-identity

if [ ${USE_TEST_LDAP} == "yes" ]; then
    echo "Starting test LDAP server (for demo)"
    $KNOX_HOME/bin/ldap.sh start
fi

echo "Starting Knox gateway service"
chown -R knox $KNOX_HOME/data/
chroot --userspec=knox / \
    java \
        -Djava.library.path=$KNOX_HOME/ext/native \
        -jar $KNOX_HOME/bin/gateway.jar
