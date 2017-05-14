#!/bin/sh
set -e

ALL_DOCKER_COMPOSE_APP_FILES="-f docker-compose-apps.yml -f docker-compose-knox.yml"
ALL_DOCKER_COMPOSE_DB_FILES="-f docker-compose.yml -f docker-compose-migrate.yml"
ALL_DOCKER_COMPOSE_FILES=${ALL_DOCKER_COMPOSE_DB_FILES}" "${ALL_DOCKER_COMPOSE_APP_FILES} 

CERTS_DIR=`dirname $0`/certs
DEFAULT_VERSION=0.0.1
DEFAULT_TAG="latest"

init_db() {
    docker-compose up -d
}

ps() {
    docker-compose ${ALL_DOCKER_COMPOSE_FILES} ps
}

list_logs() {
    DOCKER_FILES=${ALL_DOCKER_COMPOSE_APP_FILES}
    if [ "$1" == "all" ]; then
        DOCKER_FILES=${ALL_DOCKER_COMPOSE_FILES}
        shift
    elif [ "$1" == "db" ]; then
        DOCKER_FILES=${ALL_DOCKER_COMPOSE_DB_FILES}
        shift
    fi
    docker-compose ${DOCKER_FILES} logs "$@"
}

migrate_schema() {
    docker-compose -f docker-compose.yml -f docker-compose-migrate.yml up 
}

destroy() {
    docker-compose -f docker-compose.yml -f docker-compose-migrate.yml -f docker-compose-apps.yml down
}

destroy_knox() {
    docker-compose -f docker-compose-knox.yml down
    rm -rf ${CERTS_DIR}
}

init_app() {
    docker-compose -f docker-compose-apps.yml up -d
}

init_knox() {
    echo "Enter Knox master password: "
    read -s MASTER_PASSWD
    echo "Reenter password: "
    read -s MASTER_PASSWD_VERIFY
    if [ "$MASTER_PASSWD" != "$MASTER_PASSWD_VERIFY" ];
    then
       echo "Password did not match. Reenter password:"
       read -s MASTER_PASSWD_VERIFY
       if [ "$MASTER_PASSWD" != "$MASTER_PASSWD_VERIFY" ];
       then
        echo "Password did not match"
        return 1
       fi
    fi
	MASTER_PASSWORD=${MASTER_PASSWD} docker-compose -f docker-compose-knox.yml up -d
    KNOX_CONTAINER_ID=$(get_knox_container_id)
    if [ -z ${KNOX_CONTAINER_ID} ]; then
        echo "Knox container not found. Ensure it is running..."
        return -1
    fi
    docker exec -it ${KNOX_CONTAINER_ID} ./wait_for_keystore_file.sh
    mkdir -p ${CERTS_DIR}
    export_knox_cert $MASTER_PASSWD $KNOX_CONTAINER_ID > ${CERTS_DIR}/knox-signing.pem
	echo "Knox Initialized"
}

export_knox_cert() {
    MASTER_PASSWD=$1
    KNOX_CONTAINER_ID=$2
    docker exec -it ${KNOX_CONTAINER_ID} \
        keytool -export -alias gateway-identity -storepass ${MASTER_PASSWD} -keystore /var/lib/knox/data-2.6.0.3-8/security/keystores/gateway.jks -rfc
}

get_knox_container_id() {
    KNOX_CONTAINER_ID=`docker-compose -f docker-compose-knox.yml ps -q knox`
    echo ${KNOX_CONTAINER_ID}
}

start_app() {
    docker-compose -f docker-compose-apps.yml start
}

start_knox() {
    docker-compose -f docker-compose-knox.yml start
}

stop_app() {
    docker-compose -f docker-compose-apps.yml stop
}

stop_knox() {
    docker-compose -f docker-compose-knox.yml stop
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
    echo "Usage: dpdeploy.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands" "init [db|knox|app] | migrate | ps | logs [db|all] | start | stop [knox] | destroy [knox]"
    printf "%-${tabspace}s:%s\n" "init db" "Initialize postgres DB for first time"
    printf "%-${tabspace}s:%s\n" "init knox" "Initialize the Knox container"
    printf "%-${tabspace}s:%s\n" "init app" "Start the application docker containers for the first time"
    printf "%-${tabspace}s:%s\n" "migrate" "Run schema migrations on the DB"
    printf "%-${tabspace}s:%s\n" "start knox" "Start the  docker container for knox"
    printf "%-${tabspace}s:%s\n" "stop" "Stop the application docker containers"
    printf "%-${tabspace}s:%s\n" "stop knox" "Stop the Knox docker container"
    printf "%-${tabspace}s:%s\n" "ps" "List the status of the docker containers"
    local logman='List of the docker containers
        No options: app containers, db: all DB containers, all: all containers.
        All \"docker-compose logs\" options are supported'
    printf "%-${tabspace}s:%s\n" "logs" "$logman"
    printf "%-${tabspace}s:%s\n" "destroy" "Kill all containers and remove them. Needs to start from init db again"
    printf "%-${tabspace}s:%s\n" "destroy knox" "Kill Knox container and remove it. Needs to start from init knox again"
    printf "%-${tabspace}s:%s\n" "version" "Print the version of dataplane"
}

if [ $# -lt 1 ]
then
    usage;
    exit 0;
else
    case "$1" in
        init)
            echo "Found $2"
            case "$2" in
                db)
                    init_db
                    ;;
                knox)
                    init_knox
                    ;;
                app)
                    init_app
                    ;;
                *)
                    usage
                    ;;
            esac
            ;;
        migrate)
            migrate_schema
            ;;
        start)
            if [ "$2" == "knox" ]
            then
                start_knox
            else
                start_app
            fi
            ;;
        stop)
            if [ "$2" == "knox" ]
            then
                stop_knox
            else
                stop_app
            fi
            ;;
        ps)
            ps
            ;;
        logs)
            shift
            list_logs "$@"
            ;;
        destroy)
            if [ "$2" == "knox" ]
            then
                destroy_knox
            else
                destroy
            fi
            ;;
        version)
            print_version
            ;;
        *)
            usage
            ;;
    esac
fi

