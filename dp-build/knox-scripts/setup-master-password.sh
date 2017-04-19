#!/bin/sh
ls -lR ../data/security
echo Master: ${MASTER_PASSWORD}
./knoxcli.sh create-master --master ${MASTER_PASSWORD}
ls -lR ../data/security
