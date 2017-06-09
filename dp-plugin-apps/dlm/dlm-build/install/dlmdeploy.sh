#!/bin/sh
set -e

DOCKER_FILES="-f docker-compose-apps.yml"

DEFAULT_VERSION=0.0.1
DEFAULT_TAG="latest"

ps() {
    docker-compose ${DOCKER_FILES} ps
}

list_logs() {
    docker-compose ${DOCKER_FILES} logs "$@"
}


destroy() {
    docker-compose -f docker-compose-apps.yml down
}


init_app() {
    echo "Enter the Host IP Address (Consul will bind to this host):"
    read HOST_IP;
    export CONSUL_HOST=$HOST_IP;
    docker-compose -f docker-compose-apps.yml up -d
}


start_app() {
    docker-compose -f docker-compose-apps.yml start
}

stop_app() {
    docker-compose -f docker-compose-apps.yml stop
}

print_version() {
    if [ -f VERSION ]; then
        cat VERSION
    else
        cat ${DEFAULT_VERSION}:${DEFAULT_TAG}
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

