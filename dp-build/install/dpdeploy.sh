#!/bin/sh
set -e

CERTS_DIR=`dirname $0`/certs
KNOX_SIGNING_CERTIFICATE=knox-signing.pem
DEFAULT_VERSION=0.0.1
DEFAULT_TAG="latest"
export KNOX_FQDN=${KNOX_FQDN:-dataplane}

init_network() {
    NETWORK_ID=$(docker network ls --quiet --filter "name=dp")
    if [ -z ${NETWORK_ID} ]; then
        echo "Network dp not found. Creating new network with name dp."
        docker network create dp
    # This is not a clean solution and will be fixed later
    # else
    #     echo "Network dp already exists. Destroying all containers on network dp."
    #     CONTAINER_LIST=$(docker ps --all --quiet --filter "network=dp")
    #     if [[ $(echo $CONTAINER_LIST) ]]; then
    #         docker rm  --force $CONTAINER_LIST
    #     fi
    fi
}

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

init_consul(){
    echo "Initializing Consul"
    read_consul_host
    source $(pwd)/docker-consul.sh .
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

init_db() {
    source $(pwd)/docker-database.sh .
}

ps() {
    docker container ps \
        --filter "name=dp-app|dp-db-service|dp-cluster-service|dp-gateway|dp-database|knox|dp-consul-server"
}

list_logs() {
    docker logs "$@"
}

migrate_schema() {
    # start database container
    source $(pwd)/docker-database.sh .

    # wait for database start
    sleep 5

    # start flyway container and trigger migrate script
    source $(pwd)/docker-migrate.sh .
}

destroy() {
    docker container rm dp-database dp-app dp-db-service dp-cluster-service dp-gateway
}

destroy_consul(){
    echo "Destroying Consul"
    docker container rm dp-consul-server
}

destroy_knox() {
    echo "Destroying Knox"
    docker container rm knox
    rm -rf ${CERTS_DIR}/${KNOX_SIGNING_CERTIFICATE}
    destroy_consul
}

init_app() {
    echo "Initializing app"
    read_consul_host

    echo "Starting Database (Postgres)"
    source $(pwd)/docker-database.sh .

    echo "Starting Gateway"
    source $(pwd)/docker-gateway.sh .

    echo "Starting DB Service"
    source $(pwd)/docker-service-db.sh .

    echo "Starting Cluster Service"
    source $(pwd)/docker-service-cluster.sh .

    echo "Starting Application API"
    source $(pwd)/docker-app.sh .
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

init_knox() {
    echo "Initializing Knox"
    init_consul
    if [ "$MASTER_PASSWORD" == "" ]; then
        read_master_password
    fi
    if [ "$USE_TEST_LDAP" == "" ];then
        read_use_test_ldap
    fi
    
    echo "Starting Knox"
    source $(pwd)/docker-knox.sh .

    KNOX_CONTAINER_ID=$(get_knox_container_id)
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

export_knox_cert() {
    MASTER_PASSWD=$1
    KNOX_CONTAINER_ID=$2
    docker exec -t ${KNOX_CONTAINER_ID} \
        keytool -export -alias gateway-identity -storepass ${MASTER_PASSWD} -keystore /var/lib/knox/data-2.6.0.3-8/security/keystores/gateway.jks -rfc
}

get_knox_container_id() {
    KNOX_CONTAINER_ID=`docker container ps --quiet --filter="name=knox"`
    echo ${KNOX_CONTAINER_ID}
}

start_app() {
    echo "Starting Database (Postgres)"
    source $(pwd)/docker-database.sh .

    echo "Starting Gateway"
    source $(pwd)/docker-gateway.sh .

    echo "Starting DB Service"
    source $(pwd)/docker-service-db.sh .

    echo "Starting Cluster Service"
    source $(pwd)/docker-service-cluster.sh .

    echo "Starting Application API"
    source $(pwd)/docker-app.sh .
}
start_consul() {
    echo "Starting Consul"
    source $(pwd)/docker-consul.sh .
}
start_knox() {
    echo "Starting Knox"
    start_consul
    source $(pwd)/docker-knox.sh .
}

stop_app() {
    docker container stop dp-database dp-app dp-db-service dp-cluster-service dp-gateway
}

stop_consul(){
    echo "Stopping Consul"
    docker container stop dp-consul-server
}

stop_knox() {
    echo "Stopping Knox"
    docker container stop knox
    stop_consul
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
    printf "%-${tabspace}s:%s\n" "Commands" "init [db|knox|app] | migrate | ps | logs [container id|name] | start [knox]| stop [knox] | destroy [knox]"
    printf "%-${tabspace}s:%s\n" "init db" "Initialize postgres DB for first time"
    printf "%-${tabspace}s:%s\n" "init knox" "Initialize the Knox and Consul containers"
    printf "%-${tabspace}s:%s\n" "init app" "Start the application docker containers for the first time"
    printf "%-${tabspace}s:%s\n" "migrate" "Run schema migrations on the DB"
    printf "%-${tabspace}s:%s\n" "start" "Start the  docker containers for application"
    printf "%-${tabspace}s:%s\n" "start knox" "Start the Knox and Consul containers"
    printf "%-${tabspace}s:%s\n" "stop" "Stop the application docker containers"
    printf "%-${tabspace}s:%s\n" "stop knox" "Stop the Knox and Consul containers"
    printf "%-${tabspace}s:%s\n" "ps" "List the status of the docker containers"
    printf "%-${tabspace}s:%s\n" "logs [container name]" "Logs of supplied container id or name"
    printf "%-${tabspace}s:%s\n" "destroy" "Kill all containers and remove them. Needs to start from init db again"
    printf "%-${tabspace}s:%s\n" "destroy knox" "Kill Knox and Consul containers and remove them. Needs to start from init knox again"
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
