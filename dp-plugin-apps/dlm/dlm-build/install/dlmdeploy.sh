#!/bin/sh
set -e

DEFAULT_VERSION=0.0.1
DEFAULT_TAG="latest"

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
    printf "%-${tabspace}s:%s\n" "version" "Print the version of dlm"
}

if [ $# -lt 1 ]
then
    usage;
    exit 0;
else
    VERSION=$(print_version)
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
        version)
            print_version
            ;;
        *)
            usage
            ;;
    esac
fi

