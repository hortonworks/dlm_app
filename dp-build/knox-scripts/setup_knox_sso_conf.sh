#!/bin/sh

KNOX_SSO_CONF_FILE=../conf/topologies/knoxsso.xml
KNOX_SSO_TMP_FILE=/tmp/knoxsso.xml.tmp


if [ ! -f ${KNOX_SSO_CONF_FILE} ]; then
	echo "Could not find Knox SSO Configuration file. Knox SSO will need to be setup manually"
	exit -1
fi

sed '/<name>knoxsso.cookie.secure.only<\/name>/!b;n;c\            <value>false</value>' ${KNOX_SSO_CONF_FILE} | sed '/<name>knoxsso.redirect.whitelist.regex<\/name>/!b;n;c\           <value>^https?:\\/\\/(dataplane|localhost|127\.0\.0\.1|0:0:0:0:0:0:0:1|::1)(:[0-9])*.*$</value>' >> ${KNOX_SSO_TMP_FILE}

if [ $? -ne 0 ]; then
	echo "Failed modifying Knox SSO file"
	exit -1
fi

mv ${KNOX_SSO_TMP_FILE} ${KNOX_SSO_CONF_FILE}