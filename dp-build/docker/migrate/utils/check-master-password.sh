#!/bin/sh

#
# Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
#
# Except as expressly permitted in a written agreement between you or your company
# and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
# reproduction, modification, redistribution, sharing, lending or other exploitation
# of all or any part of the contents of this software is strictly prohibited.
#

if keytool \
    -list \
    -storetype jceks \
    -keystore /dp-shared/dp-keystore.jceks \
    -storepass "$MASTER_PASSWORD" \
    -alias "dummy"  &> /dev/null; then
    echo "Master password verification successful!"
else
    echo "Master password is incorrect. Please try again."
    exit -1
fi