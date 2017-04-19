#!/bin/sh
set -e

ALL_DOCKER_COMPOSE_APP_FILES="-f docker-compose-apps.yml -f docker-compose-knox.yml"
ALL_DOCKER_COMPOSE_DB_FILES="-f docker-compose.yml -f docker-compose-migrate.yml"
ALL_DOCKER_COMPOSE_FILES=${ALL_DOCKER_COMPOSE_DB_FILES}" "${ALL_DOCKER_COMPOSE_APP_FILES} 

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
}

build_images() {
    docker-compose -f docker-compose-apps.yml build
}

build_knox() {
    docker build -f Dockerfile.knox -t hortonworks/dataplane-knox .
}

init_app() {
    docker-compose -f docker-compose-apps.yml up -d
}

init_knox() {
    echo "Enter master password for Knox: "
    read MASTER_PASSWD
    MASTER_PASSWORD=${MASTER_PASSWD} docker-compose -f docker-compose-knox.yml up -d
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

usage() {
    echo "Usage: dpdeploy.sh <command> \\n \
            Commands: init [db|knox|app] | migrate | build [knox] | ps | logs [db|all] | start | stop [knox] | destroy [knox]\\n \
            init db: Initialize postgres DB for first time\\n \
            init knox: Initialize the Knox container\\n \
            init app: Start the application docker containers for the first time \\n \
            migrate: Run schema migrations on the DB \\n \
            build: Create images of Dataplane specific containers \\n \
            build knox: Create Knox image for Dataplane \\n \
            start knox: Start the application docker containers \\n \
            stop: Stop the application docker containers \\n \
            stop knox: Stop the Knox docker container \\n \
            ps: List the status of the docker containers \\n \
            logs: List logs of the docker containers \\n \
                  No options: app containers, db: all DB containers, all: all containers. \\n \
                  All \"docker-compose logs\" options are supported. \\n \
            destroy: Kill all containers and remove them. Needs to start from init db again. \\n \
            destroy knox: Kill Knox container and remove it. Needs to start from init knox again.
            "
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
        build)
            if [ "$2" == "knox" ]
            then
                build_knox
            else
                build_images
            fi
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
        *)
            usage
            ;;
    esac
fi

