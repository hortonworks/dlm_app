#!/bin/sh

# KNOX_SSO_CONF_FILE=../conf/topologies/knoxsso.xml
# KNOX_SSO_MODIFIED_FILE=../conf/topologies/knoxsso.xml.bak


# if [ ! -f ${KNOX_SSO_CONF_FILE} ]; then
# 	echo "Could not find Knox SSO Configuration file. Knox SSO will need to be setup manually"
# 	exit -1
# fi

# if [ ${USE_TEST_LDAP} == "yes" ]; then
#     java -cp ../lib/dp-configurator-1.0-SNAPSHOT.jar com.hortonworks.dataplane.config.KnoxSSOConfig --test ${KNOX_SSO_CONF_FILE}
# else
#     java -cp ../lib/dp-configurator-1.0-SNAPSHOT.jar com.hortonworks.dataplane.config.KnoxSSOConfig --prod ${KNOX_SSO_CONF_FILE}
# fi

# if [ $? -ne 0 ]; then
# 	echo "Failed modifying Knox SSO file"
# 	exit -1
# fi

# mv ${KNOX_SSO_MODIFIED_FILE} ${KNOX_SSO_CONF_FILE}

# empty file: would be removed later with PR #528
echo "KnoxSSO would be setup later by Knox Agent"