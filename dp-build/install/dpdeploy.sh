#!/bin/sh
set -e

CERTS_DIR=`dirname $0`/certs
KNOX_SIGNING_CERTIFICATE=knox-signing.pem
# CONSUL_HOST=dp-consul-server

export KNOX_FQDN=${KNOX_FQDN:-dataplane}
############# Cleanup Dunctions ################
cleanup_knox() {
    echo "Cleaning up Knox: Removing certificates"
    rm -rf ${CERTS_DIR}/${KNOX_SIGNING_CERTIFICATE}
}
################################################

############# Utility Functions ################

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
    if [ "$MASTER_PASSWORD" == "" ]; then
        read_master_password
    fi
    if [ "$USE_TEST_LDAP" == "" ]; then
        read_use_test_ldap
    fi

    echo "Starting Consul first..."
    source $(pwd)/docker-consul.sh .

    echo "Then starting Knox..."
    source $(pwd)/docker-knox.sh .

    KNOX_CONTAINER_ID=$(docker ps --all --quiet --filter "name=knox")
    if [ -z ${KNOX_CONTAINER_ID} ]; then
        echo "Knox container not found. Ensure it is running..."
        return -1
    fi

    docker exec \
        --tty \
        ${KNOX_CONTAINER_ID} \
        ./wait_for_keystore_file.sh

    mkdir -p ${CERTS_DIR}
    docker exec \
        --tty \
        ${KNOX_CONTAINER_ID} \
        keytool \
            -export \
            -alias gateway-identity \
            -storepass ${MASTER_PASSWD} \
            -keystore /var/lib/knox/data-2.6.0.3-8/security/keystores/gateway.jks \
            -rfc
    if [ ${USE_TEST_LDAP} == "no" ]; then
        docker exec \
            --interactive \
            --tty \
            ${KNOX_CONTAINER_ID} \
            ./setup_knox_sso_conf.sh
    fi
    echo "Knox Initialized"
}

get_bind_address_from_consul_container() {
    CONSUL_ID=$(docker ps --all --quiet --filter "name=dp-consul-server")
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

get_version() {
    if [ -f VERSION ]
    then
        VERSION_STRING=`cat ./VERSION`
        echo ${VERSION_STRING}
    else
        { echo "Unable to find VERSION file."; exit 1; }
    fi
}
################################################

init_application() {
    echo "Initializing application"

    echo "Configuring Consul"
    read_consul_host

    echo "Configuring Knox"
    init_knox

    echo "Configuring Database (schema)"
    reset_schema
}

start_application() {
    echo "Starting Consul"
    source $(pwd)/docker-consul.sh .

    echo "Starting Knox"
    source $(pwd)/docker-knox.sh .

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

stop_application() {
    docker stop $(docker ps --all --quiet --filter "network=dp")
}

destroy_application() {
    # stop first
    stop_application

    # then destroy
    docker rm $(docker ps --all --quiet --filter "network=dp")

    # finally cleanup
    cleanup_knox
}

reset_schema() {
    # start database container
    source $(pwd)/docker-database.sh .
    # start flyway container and trigger migrate script
    source $(pwd)/docker-migrate.sh .
}

ps() {
    docker ps --filter "network=dp"
}

list_logs() {
    docker logs "$@"
}

usage() {
    local tabspace=20
    echo "Usage: dpdeploy.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands" "init | reset | start | stop | ps | logs [container_name] | destroy"
    printf "%-${tabspace}s:%s\n" "init" "Start the application docker containers for the first time"

    printf "%-${tabspace}s:%s\n" "reset" "Run schema migrations on the DB"

    printf "%-${tabspace}s:%s\n" "start" "Start the  docker containers for application"
    printf "%-${tabspace}s:%s\n" "stop" "Stop the application docker containers"
    printf "%-${tabspace}s:%s\n" "destroy" "Kill all containers and remove them. Needs to start from init db again"

    printf "%-${tabspace}s:%s\n" "ps" "List the status of the docker containers"
    local logman='List of the docker containers
        No options: app containers, db: all DB containers, all: all containers.
        All \"docker logs\" options are supported'
    printf "%-${tabspace}s:%s\n" "logs" "$logman"
    printf "%-${tabspace}s:%s\n" "version" "Print the version of dataplane"
}

print_version() {
    echo $(get_version)
}


VERSION=$(get_version)

if [ $# -lt 1 ]
then
    usage;
    exit 0;
else
    case "$1" in
        init)
            init_application
            ;;
        reset)
            reset_schema
            ;;
        start)
            start_application
            ;;
        stop)
            stop_application
            ;;
        destroy)
             destroy_application
            ;;
        ps)
            ps
            ;;
        logs)
            shift
            list_logs "$@"
            ;;
        version)
            print_version
            ;;
        *)
            usage
            ;;
    esac
fi
