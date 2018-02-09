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

update_config() {
    local KEY="$1"
    local VALUE="$2"

    local UPDATE_QUERY="UPDATE dataplane.configs SET config_value = '$VALUE' WHERE config_key = '$KEY'"
    psql -c "$UPDATE_QUERY"

    echo "Config value for key $KEY was updated successfully with value $VALUE"
}

main() {
    local KEY="$1"
    local ACTION="$2"
    if [ "$ACTION" == "ENABLE" ]
    then
       update_config "$KEY" "true"
    else
       update_config "$KEY" "false"
    fi
}

main "$@"