#!/bin/sh
set -e

source $(pwd)/config.env.sh

CERTS_DIR=`dirname $0`/certs
KNOX_SIGNING_CERTIFICATE=knox-signing.pem
DEFAULT_VERSION=0.0.1
DEFAULT_TAG="latest"
KNOX_FQDN=${KNOX_FQDN:-dataplane}

APP_CONTAINERS="dp-app dp-db-service dp-cluster-service dp-gateway"
if [ "$USE_EXT_DB" == "no" ]; then
    APP_CONTAINERS="dp-database $APP_CONTAINERS"
fi
KNOX_CONTAINER="knox"
CONSUL_CONTAINER="dp-consul-server"

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

init_consul(){
    echo "Initializing Consul"
    source $(pwd)/docker-consul.sh
}

init_db() {
    if [ "$USE_EXT_DB" == "yes" ]; then
        echo "Dataplane is configured to use an external database in config.env.sh. Database initialization is not required and assumed to be done already."
    else
        source $(pwd)/docker-database.sh
    fi
}

ps() {
    docker ps \
        --filter "name=dp-app|dp-db-service|dp-cluster-service|dp-gateway|dp-database|knox|dp-consul-server|dp-migrate"
}

list_logs() {
    docker logs "$@"
}

migrate_schema() {
    if [ "$USE_EXT_DB" == "no" ]; then
        # start database container
        source $(pwd)/docker-database.sh
    fi

    # wait for database start
    sleep 5

    # start flyway container and trigger migrate script
    source $(pwd)/docker-migrate.sh
}

destroy() {
    docker rm --force $APP_CONTAINERS
}

destroy_consul(){
    echo "Destroying Consul"
    docker rm --force $CONSUL_CONTAINER
}

destroy_knox() {
    echo "Destroying Knox"
    docker rm --force $KNOX_CONTAINER
    rm -rf ${CERTS_DIR}/${KNOX_SIGNING_CERTIFICATE}
    destroy_consul
}

init_app() {
    echo "Initializing app"

    if [ "$USE_EXT_DB" == "no" ]; then
        echo "Starting Database (Postgres)"
        source $(pwd)/docker-database.sh
    fi

    echo "Starting Gateway"
    source $(pwd)/docker-gateway.sh

    echo "Starting DB Service"
    source $(pwd)/docker-service-db.sh

    echo "Starting Cluster Service"
    source $(pwd)/docker-service-cluster.sh

    echo "Starting Application API"
    source $(pwd)/docker-app.sh
}

init_knox() {
    echo "Initializing Knox"
    init_consul
    
    echo "Starting Knox"
    source $(pwd)/docker-knox.sh

    docker exec -t knox ./wait_for_keystore_file.sh
    mkdir -p ${CERTS_DIR}
    export_knox_cert ${MASTER_PASSWORD} knox > ${CERTS_DIR}/${KNOX_SIGNING_CERTIFICATE}
    if [ ${USE_TEST_LDAP} == "no" ]
    then
        docker exec -it knox ./setup_knox_sso_conf.sh
    fi
    echo "Knox Initialized"
}

export_knox_cert() {
    MASTER_PASSWD=$1
    KNOX_CONTAINER_ID=$2
    docker exec -t ${KNOX_CONTAINER_ID} \
        keytool -export -alias gateway-identity -storepass ${MASTER_PASSWD} -keystore /var/lib/knox/data-2.6.0.3-8/security/keystores/gateway.jks -rfc
}

start_app() {
    if [ "$USE_EXT_DB" == "no" ]; then
        echo "Starting Database (Postgres)"
        source $(pwd)/docker-database.sh
    fi

    echo "Starting Gateway"
    source $(pwd)/docker-gateway.sh

    echo "Starting DB Service"
    source $(pwd)/docker-service-db.sh

    echo "Starting Cluster Service"
    source $(pwd)/docker-service-cluster.sh

    echo "Starting Application API"
    source $(pwd)/docker-app.sh
}
start_consul() {
    echo "Starting Consul"
    source $(pwd)/docker-consul.sh
}
start_knox() {
    echo "Starting Knox"
    start_consul
    source $(pwd)/docker-knox.sh
}

stop_app() {
    docker stop $APP_CONTAINERS
}

stop_consul(){
    echo "Stopping Consul"
    docker stop $CONSUL_CONTAINER
}

stop_knox() {
    echo "Stopping Knox"
    docker stop $KNOX_CONTAINER
    stop_consul
}

init_all() {
    init_db >> install.log 2>&1
    migrate_schema >> install.log 2>&1

    init_knox >> install.log 2>&1

    init_app >> install.log 2>&1

    echo "Initialization and start complete."
}

start_all() {
    start_knox >> install.log 2>&1

    start_app >> install.log 2>&1

    echo "Start complete."
}

stop_all() {
    stop_app >> install.log 2>&1

    stop_knox >> install.log 2>&1

    echo "Stop complete."
}

destroy_all() {
    destroy >> install.log 2>&1

    destroy_knox >> install.log 2>&1

    echo "Destroy complete."
}

print_version() {
    if [ -f VERSION ]; then
        cat VERSION
    else
        echo ${DEFAULT_VERSION}-${DEFAULT_TAG}
    fi
}

usage() {
    local tabspace=20
    echo "Usage: dpdeploy.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands" "init [db | knox | app |--all] | migrate | ps | logs [container id|name] | start [knox | --all]| stop [knox | --all] | destroy [knox | --all]"
    printf "%-${tabspace}s:%s\n" "init db" "Initialize postgres DB for first time"
    printf "%-${tabspace}s:%s\n" "init knox" "Initialize the Knox and Consul containers"
    printf "%-${tabspace}s:%s\n" "init app" "Start the application docker containers for the first time"
    printf "%-${tabspace}s:%s\n" "init --all" "Initialize and start all containers for the first time"
    printf "%-${tabspace}s:%s\n" "migrate" "Run schema migrations on the DB"
    printf "%-${tabspace}s:%s\n" "start" "Start the  docker containers for application"
    printf "%-${tabspace}s:%s\n" "start knox" "Start the Knox and Consul containers"
    printf "%-${tabspace}s:%s\n" "start --all" "Start all containers"
    printf "%-${tabspace}s:%s\n" "stop" "Stop the application docker containers"
    printf "%-${tabspace}s:%s\n" "stop knox" "Stop the Knox and Consul containers"
    printf "%-${tabspace}s:%s\n" "stop --all" "Stop all containers"
    printf "%-${tabspace}s:%s\n" "ps" "List the status of the docker containers"
    printf "%-${tabspace}s:%s\n" "logs [container name]" "Logs of supplied container id or name"
    printf "%-${tabspace}s:%s\n" "destroy" "Kill all containers and remove them. Needs to start from init db again"
    printf "%-${tabspace}s:%s\n" "destroy knox" "Kill Knox and Consul containers and remove them. Needs to start from init knox again"
    printf "%-${tabspace}s:%s\n" "destroy --all" "Kill all containers and remove them. Needs to start from init again"
    printf "%-${tabspace}s:%s\n" "version" "Print the version of dataplane"
}

VERSION=$(print_version)
init_network

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
                --all)
                    init_all
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
            case "$2" in
                knox) start_knox
                ;;
                --all)
                    start_all
                    ;;
                *) start_app
             esac
             ;;
        stop)
            case "$2" in
                knox) stop_knox
                ;;
                --all)
                    stop_all
                    ;;
                *) stop_app
             esac
             ;;

        ps)
            ps
            ;;
        logs)
            shift
            list_logs "$@"
            ;;
        destroy)
            case "$2" in
                knox) destroy_knox
                ;;
                --all)
                    destroy_all
                    ;;
                *) destroy
                 ;;
             esac
             ;;
        version)
            print_version
            ;;
        *)
            usage
            ;;
    esac
fi
