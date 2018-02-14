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

get_config() {

    local KEY="$1"
    local GET_QUERY="SELECT config_value from dataplane.configs WHERE config_key = '$KEY'"
    psql -c "$GET_QUERY"
}

main() {
   get_config "$@"
}

main "$@"