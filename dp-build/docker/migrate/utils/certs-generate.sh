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

openssl req \
    -x509 \
    -newkey rsa:4096 \
    -subj '/CN=dataplane' \
    -keyout /dp-shared/ssl-key.pem \
    -out /dp-shared/ssl-cert.pem \
    -passout pass:"$CERTIFICATE_PASSWORD" \
    -days 365

chmod 600 /dp-shared/ssl-key.pem
chmod 600 /dp-shared/ssl-cert.pem
