#!/bin/sh

#
# Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
#
# Except as expressly permitted in a written agreement between you or your company
# and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
# reproduction, modification, redistribution, sharing, lending or other exploitation
# of all or any part of the contents of this software is strictly prohibited.
#

set -e

DEFAULT_VERSION=0.0.1-latest
CONSUL_CONTAINER="dp-consul-server"
DSS_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


source_dp_config () {
    # Expected to be present in RPM deployments
    DP_CONFIG_FILE_PATH="/usr/dp/current/core/bin/config.env.sh"
    if [ -f "${DP_CONFIG_FILE_PATH}" ]; then
        source "${DP_CONFIG_FILE_PATH}";
    fi
    CONSUL_HOST="$CONSUL_CONTAINER"
}

init_network() {
    IS_NETWORK_PRESENT="false"
    docker network inspect --format "{{title .ID}}" dp >> "$DSS_PATH"/install.log 2>&1 && IS_NETWORK_PRESENT="true"
    if [ $IS_NETWORK_PRESENT == "false" ]; then
        echo "Network dp not found. Creating new network with name dp."
        docker network create dp
    # This is not a clean solution and will be fixed later
    # else
    #     echo "Network dp already exists. Destroying all containers on network dp."
    #     CONTAINER_LIST=$(docker container ls --all --quiet --filter "network=dp")
    #     if [[ $(echo $CONTAINER_LIST) ]]; then
    #         docker rm  --force $CONTAINER_LIST
    #     fi
    fi
}

ps() {
    docker ps --filter "name=dss-app"
}

list_logs() {
    docker logs dss-app
}

do_confirm_destroy(){
   printf "\n${BRIGHT}Warning!${NORMAL}\nThis command will destroy all the DSS containers and the data associated with them. This action cannot be undone.\n\n"
   local option
   read -p "Do you want to continue? (yes/no): " option
   if [ "$option" == "yes" ]
    then
        destroy
    else
        printf "\nContainers are not destroyed.\n"
        exit -1
    fi
}

do_confirm_stop(){
   printf "\n${BRIGHT}Warning!${NORMAL}\nThis command will stop all the DSS containers.\n\n"
   local option
   read -p "Do you want to continue? (yes/no): " option
   if [ "$option" == "yes" ]
    then
         stop_app
    else
        printf "\nContainers are not stopped.\n"
        exit -1
    fi
}

destroy() {
    docker rm --force dss-app
}

init_app() {
    docker start dss-app >> "$DSS_PATH"/install.log 2>&1 || \
        docker run -it \
            --name dss-app \
            --network dp \
            --detach \
            --env "CONSUL_HOST=$CONSUL_HOST" \
            --env DSS_APP_HOME="/usr/dss-app" \
            hortonworks/dss-app:$VERSION
}


start_app() {
    docker start dss-app
}

stop_app() {
    docker stop dss-app
}

load_image() {
    LIB_DIR="$( dirname "${DSS_PATH}" )/lib"
    if [ -d "$LIB_DIR" ]; then
        for imgFileName in $LIB_DIR/*.tar; do
            echo "Loading $imgFileName"
            docker load --input $imgFileName
        done
        echo "All done!"
    else
        echo "$LIB_DIR directory does not exist."
    fi
}

upgrade() {
    destroy || echo "App is not up."

    # init all but db and knox
    init_app

    echo "Upgrade complete."
}

print_version() {
    if [ -f VERSION ]; then
        cat VERSION
    else
        echo ${DEFAULT_VERSION}
    fi
}

usage() {
   source "$DSS_PATH"/help.sh
   exit -1
}

if [ $# -lt 1 ] || [ ${@:$#} == "--help" ]
then
    source "$DSS_PATH"/help.sh "$@"
    exit 0;
else
    VERSION=$(print_version)
    source_dp_config
    init_network

    case "$1" in
        init)
           init_app
             ;;

        start)
           start_app
           ;;
        stop)
           do_confirm_stop
           ;;
        ps)
            ps
            ;;
        logs)
            shift
            list_logs "$@"
            ;;
        destroy)
            do_confirm_destroy
            ;;
        load)
            load_image
            ;;
        upgrade)
            upgrade
            ;;
        version)
            print_version
            ;;
        *)
            usage
            ;;
    esac
fi
