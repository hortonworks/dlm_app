#!/bin/sh

init_db() {
    docker-compose up -d
}

ps() {
    docker-compose -f docker-compose.yml -f docker-compose-migrate.yml -f docker-compose-apps.yml ps
}

migrate_schema() {
    docker-compose -f docker-compose.yml -f docker-compose-migrate.yml up -d
}

destroy() {
    docker-compose -f docker-compose.yml -f docker-compose-migrate.yml -f docker-compose-apps.yml down
}

build_images() {
    docker-compose -f docker-compose.yml -f docker-compose-apps.yml build
}

init_app() {
    docker-compose -f docker-compose.yml -f docker-compose-apps.yml up
}

start_app() {
    docker-compose -f docker-compose.yml -f docker-compose-apps.yml start
}

stop_app() {
    docker-compose -f docker-compose.yml -f docker-compose-apps.yml stop
}

usage() {
    echo "Usage: dpdeploy.sh <command> \\n \
            Commands: initdb | migrate | build | up | ps | start | stop | down\\n \
            initdb: Initialize postgres DB for first time\\n \
            migrate: Run schema migrations on the DB \\n \
            build: Create images of Dataplane specific containers \\n \
            initapp: Start the application docker containers for the first time \\n \
            start: Start the application docker containers \\n \
            stop: Stop the application docker containers \\n \
            ps: List the status of the docker containers \\n \
            destroy: Kill all containers and remove them \\n
            "
}

if [ $# != 1 ]
then
    usage;
    exit 0;
else
    case "$1" in
        initdb) 
            init_db
            ;;
        migrate)
            migrate_schema
            ;;
        build)
            build_images
            ;;
        initapp)
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
        destroy)
            destroy
            ;;
        *) 
            usage
            ;;
    esac
fi

