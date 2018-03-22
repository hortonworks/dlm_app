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

RENAME USE_EXT_DB USE_EXTERNAL_DB
RENAME PUBLIC_KEY_L DATAPLANE_CERTIFICATE_PUBLIC_KEY_PATH
RENAME PRIVATE_KEY_L DATAPLANE_CERTIFICATE_PRIVATE_KEY_PATH

REMOVE SEPARATE_KNOX_CONFIG
REMOVE KNOX_CONFIG_USING_CREDS
