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

update_user_password() {
    local USERNAME="$1"
    local PASSWORD="$2"

    local PASSWORD_HASH=`/bcrypter/bin/bcrypter "$PASSWORD"`
    local UPDATE_QUERY="UPDATE dataplane.users SET password = '$PASSWORD_HASH' WHERE user_name = '$USERNAME'"
    psql -c "$UPDATE_QUERY"

    echo "Password for user $USERNAME was updated successfully"
}

main() {
    local USERNAME="admin"
    local PASSWORD="$1"

    update_user_password "$USERNAME" "$PASSWORD"
}

main "$@"
