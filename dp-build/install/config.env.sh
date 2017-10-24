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

# DB Configs
USE_EXT_DB="no"
# DATABASE_URI="jdbc:postgresql://host_name:5432/dataplane"
# DATABASE_USER="<username>"
# DATABASE_PASS="<password>"

# SSL Configs
USE_TLS="true"
USE_PROVIDED_CERTIFICATES="no"
# PUBLIC_KEY_L="/absolute/path/of/public/key.pem"
# PRIVATE_KEY_L="/absolute/path/of/private/key.pem"

# Knox Configs
SEPARATE_KNOX_CONFIG=false
KNOX_CONFIG_USING_CREDS=true

# Uncomment and set right values for below lines to enable silent install
# CONSUL_HOST="<host_ip_address>"
# USE_TEST_LDAP="yes"
