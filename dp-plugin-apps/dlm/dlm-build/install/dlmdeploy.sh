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

DEFAULT_VERSION=0.0.1
DEFAULT_TAG="latest"

init_network() {
    IS_NETWORK_PRESENT="false"
    docker network inspect --format "{{title .ID}}" dp >> install.log 2>&1 && IS_NETWORK_PRESENT="true"
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
    docker ps --filter "name=dlm-app"
}

list_logs() {
    docker logs dlm-app
}


destroy() {
    docker rm --force dlm-app
}


read_consul_host() {
    echo "Enter the Host IP Address (Consul will bind to this host):"
    read HOST_IP;
    export CONSUL_HOST=$HOST_IP;
}

init_app() {
    if [ "$CONSUL_HOST" == "" ]; then
        read_consul_host
    fi
    docker start dlm-app >> install.log 2>&1 || \
        docker run \
            --name dlm-app \
            --network dp \
            --publish 9011:9011 \
            --detach \
            --env CONSUL_HOST \
            --env DLM_APP_HOME="/usr/dlm-app" \
            hortonworks/dlm-app:$VERSION
}


start_app() {
    docker start dlm-app
}

stop_app() {
    docker stop dlm-app
}

load_image() {
    LIB_DIR=../lib
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
        echo ${DEFAULT_VERSION}:${DEFAULT_TAG}
    fi
}

usage() {
    local tabspace=20
    echo "Usage: dlmdeploy.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands" "init | ps | logs | start | stop | destroy"
    printf "%-${tabspace}s:%s\n" "init" "Start the application docker containers for the first time"
    printf "%-${tabspace}s:%s\n" "start" "Start the  application docker container"
    printf "%-${tabspace}s:%s\n" "stop" "Stop the application docker containers"
    printf "%-${tabspace}s:%s\n" "ps" "List the status of the docker containers"
    printf "%-${tabspace}s:%s\n" "logs" "Log of the application docker containers"
    printf "%-${tabspace}s:%s\n" "destroy" "Kill all containers and remove them"
    printf "%-${tabspace}s:%s\n" "load" "Load image from lib directory into docker"
    printf "%-${tabspace}s:%s\n" "upgrade" "Upgrade existing dlm to current version"
    printf "%-${tabspace}s:%s\n" "version" "Print the version of dlm"
}

if [ $# -lt 1 ]
then
    usage;
    exit 0;
else
    VERSION=$(print_version)
    init_network

    case "$1" in
        init)
           init_app
             ;;

        start)
           start_app
           ;;
        stop)
           stop_app
           ;;
        ps)
            ps
            ;;
        logs)
            shift
            list_logs "$@"
            ;;
        destroy)
            destroy
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
