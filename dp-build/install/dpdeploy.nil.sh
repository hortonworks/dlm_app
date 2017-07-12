#!/bin/sh
set -e

ALL_DOCKER_COMPOSE_APP_FILES="-f docker-compose-apps.yml -f docker-compose-knox.yml -f docker-compose-consul.yml"
ALL_DOCKER_COMPOSE_FILES=${ALL_DOCKER_COMPOSE_DB_FILES}" "${ALL_DOCKER_COMPOSE_APP_FILES} 

CERTS_DIR=`dirname $0`/certs
KNOX_SIGNING_CERTIFICATE=knox-signing.pem
DEFAULT_VERSION=0.0.1

export KNOX_FQDN=${KNOX_FQDN:-dataplane}

init_consul(){
  echo "Initializing Consul"
  read_consul_host
  docker-compose -f docker-compose-consul.yml up -d
}

start_consul() {
    echo "Starting Consul"
    source $(pwd)/docker-consul.sh .
}

stop_consul(){
    echo "Stopping Consul"
    source $(pwd)/docker-consul.sh .
}

destroy_consul(){
    echo "Destroying Consul"
    docker-compose -f docker-compose-consul.yml down
}

init_app() {
    echo "Initializing app"
    read_consul_host
    docker-compose -f docker-compose-apps.yml up -d
}

read_master_password() {
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
        exit 1
       fi
    fi
    export MASTER_PASSWORD="$MASTER_PASSWD"
}

read_use_test_ldap() {
    echo "Use pre-packaged LDAP instance (suitable only for testing) [yes/no]: "
    read USE_TEST_LDAP
    export USE_TEST_LDAP
}

export_knox_cert() {
    MASTER_PASSWD=$1
    KNOX_CONTAINER_ID=$2
    docker exec -t ${KNOX_CONTAINER_ID} \
        keytool -export -alias gateway-identity -storepass ${MASTER_PASSWD} -keystore /var/lib/knox/data-2.6.0.3-8/security/keystores/gateway.jks -rfc
}

init_knox() {
    echo "Initializing Knox"
    init_consul
    if [ "$MASTER_PASSWORD" == "" ]; then
        read_master_password
    fi
    if [ "$USE_TEST_LDAP" == "" ];then
        read_use_test_ldap
    fi

    docker-compose -f docker-compose-knox.yml up -d
    
    KNOX_CONTAINER_ID=$(docker ps -aqf "name=knox")
    if [ -z ${KNOX_CONTAINER_ID} ]; then
        echo "Knox container not found. Ensure it is running..."
        return -1
    fi
    docker exec -t ${KNOX_CONTAINER_ID} ./wait_for_keystore_file.sh
    mkdir -p ${CERTS_DIR}
    export_knox_cert ${MASTER_PASSWORD} ${KNOX_CONTAINER_ID} > ${CERTS_DIR}/${KNOX_SIGNING_CERTIFICATE}
    if [ ${USE_TEST_LDAP} == "no" ]
    then
        docker exec -it ${KNOX_CONTAINER_ID} ./setup_knox_sso_conf.sh
    fi
    echo "Knox Initialized"
}

start_knox() {
    echo "Starting Knox"
    start_consul
    docker-compose -f docker-compose-knox.yml start
}

stop_knox() {
    echo "Stopping Knox"
    docker-compose -f docker-compose-knox.yml stop
    stop_consul
}

destroy_knox() {
    echo "Destroying Knox"
    docker-compose -f docker-compose-knox.yml down
    rm -rf ${CERTS_DIR}/${KNOX_SIGNING_CERTIFICATE}
    destroy_consul
}

start_app() {
    docker-compose -f docker-compose-apps.yml start
    
}

stop_app() {
    docker-compose -f docker-compose-apps.yml stop
}

destroy() {
    docker-compose -f docker-compose.yml -f docker-compose-migrate.yml -f docker-compose-apps.yml down
}

init_db() {
    source $(pwd)/docker-database.sh .
}

migrate_schema() {
    source $(pwd)/docker-database.sh .
    source $(pwd)/docker-migrate.sh .
}

ps() {
    docker ps --filter "network=dp"
}

list_logs() {
    DOCKER_FILES=${ALL_DOCKER_COMPOSE_APP_FILES}
    if [ "$1" == "all" ]; then
        DOCKER_FILES=${ALL_DOCKER_COMPOSE_FILES}
        shift
    fi
    docker-compose ${DOCKER_FILES} logs "$@"
}

print_version() {
    if [ -f VERSION ]; then
        cat VERSION
    else
        cat ${DEFAULT_VERSION}
    fi
}

usage() {
    local tabspace=20
    echo "Usage: dpdeploy.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands" "init [db|knox|app] | migrate | ps | logs [db|all] | start [knox]| stop [knox] | destroy [knox]"
    printf "%-${tabspace}s:%s\n" "init db" "Initialize postgres DB for first time"
    printf "%-${tabspace}s:%s\n" "init app" "Start the application docker containers for the first time"

    printf "%-${tabspace}s:%s\n" "migrate" "Run schema migrations on the DB"

    printf "%-${tabspace}s:%s\n" "start" "Start the  docker containers for application"
    printf "%-${tabspace}s:%s\n" "stop" "Stop the application docker containers"
    printf "%-${tabspace}s:%s\n" "destroy" "Kill all containers and remove them. Needs to start from init db again"

    printf "%-${tabspace}s:%s\n" "ps" "List the status of the docker containers"
    local logman='List of the docker containers
        No options: app containers, db: all DB containers, all: all containers.
        All \"docker-compose logs\" options are supported'
    printf "%-${tabspace}s:%s\n" "logs" "$logman"
    printf "%-${tabspace}s:%s\n" "version" "Print the version of dataplane"
}

############# Utility Functions ################
get_bind_address_from_consul_container() {
    CONSUL_ID=$(docker ps -af 'name=consul' -q)
    if [ -z ${CONSUL_ID} ]; then
        return 0
    fi
    CONSUL_ARGS=$(docker inspect -f {{.Args}} ${CONSUL_ID})
    for word in $CONSUL_ARGS; do
        if [[ $word == -bind* ]]
        then
            BIND_ADDR=${word##*=}
        fi
    done
    export CONSUL_HOST=${BIND_ADDR};
}

read_consul_host(){
    if [ -z "${CONSUL_HOST}" ]; then
        get_bind_address_from_consul_container
    fi
    if [ -z "${CONSUL_HOST}" ]; then
        echo "Enter the Host IP Address (Consul will bind to this host):"
        read HOST_IP;
        export CONSUL_HOST=$HOST_IP;
    fi
    echo "using CONSUL_HOST: ${CONSUL_HOST}"
}
################################################

if [ $# -lt 1 ]
then
    usage;
    exit 0;
else
    case "$1" in
        init)
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
            case "$2" in
                knox) start_knox
                ;;
                *) start_app
             esac
             ;;
        stop)
            case "$2" in
                knox) stop_knox
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
