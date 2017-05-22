#!/bin/sh
if [ ! -d ../data/security/master ]
then
    ./setup-master-password.sh
    if [ ${USE_TEST_LDAP} == "yes" ]
    then
        USE_TEST_LDAP=yes ./setup_knox_sso_conf.sh 
    fi    
fi    
echo "Starting services ..."
ls -lR ../data/security/
./ldap.sh start
/usr/bin/java -Djava.library.path=/usr/hdp/2.6.0.3-8/knox/ext/native -jar /usr/hdp/2.6.0.3-8/knox/bin/gateway.jar
