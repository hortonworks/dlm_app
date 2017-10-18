#!/bin/bash
#
# /*
#  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
#  *
#  * Except as expressly permitted in a written agreement between you or your company
#  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
#  * reproduction, modification, redistribution, sharing, lending or other exploitation
#  * of all or any part of the contents of this software is strictly prohibited.
#  */
#
set -e

source $(pwd)/config.env.sh

DEFAULT_VERSION=0.0.1-latest

CLUSTER_SERVICE_CONTAINER="dp-cluster-service"
DB_CONTAINER="dp-database"
APP_CONTAINERS_WITHOUT_DB="dp-app dp-db-service $CLUSTER_SERVICE_CONTAINER dp-gateway"
APP_CONTAINERS=$APP_CONTAINERS_WITHOUT_DB
if [ "$USE_EXT_DB" == "no" ]; then
    APP_CONTAINERS="$DB_CONTAINER $APP_CONTAINERS"
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

get_bind_address_from_consul_container() {
    CONSUL_ID=$(docker ps --all --quiet --filter "name=$CONSUL_CONTAINER")
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
    CONSUL_HOST=${BIND_ADDR};
}

init_consul(){
    echo "Initializing Consul"
    read_consul_host
    source $(pwd)/docker-consul.sh
}

read_consul_host(){
    if [ -z "${CONSUL_HOST}" ]; then
        get_bind_address_from_consul_container
    fi
    if [ -z "${CONSUL_HOST}" ]; then
        echo "Enter the Host IP Address (Consul will bind to this host):"
        read HOST_IP;
        CONSUL_HOST=$HOST_IP;
    fi
    echo "using CONSUL_HOST: ${CONSUL_HOST}"
}

generate_certs() {
    CERTIFICATE_PASSWORD=${MASTER_PASSWORD}

    source $(pwd)/docker-certificates.sh
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

list_metrics() {
    echo "{\"service_metrics\": "
    docker exec -it dp-gateway bash -c "curl http://localhost:8762/service/metrics"
    echo ",\"gateway_metrics\": "
    docker exec -it dp-gateway bash -c "curl http://localhost:8762/metrics"
    echo "}"
}

migrate_schema() {
    if [ "$USE_EXT_DB" == "no" ]; then
        # start database container
        source $(pwd)/docker-database.sh

        # wait for database start
        source $(pwd)/database-check.sh
    fi

    # start flyway container and trigger migrate script
    source $(pwd)/docker-flyway.sh migrate
}

reset_db() {
    if [ "$USE_EXT_DB" == "no" ]; then
        # start database container
        source $(pwd)/docker-database.sh

        # wait for database start
        source $(pwd)/database-check.sh
    fi

    # start flyway container and trigger migrate script
    source $(pwd)/docker-flyway.sh clean migrate
}

utils_add_host() {
    if [ $# -ne 2 ]; then
        echo "Invalid arguments."
        echo "Usage: dpdeploy.sh utils add-host <ip> <host>"
        return -1
    else
        add_host_entry "$@"
    fi
}

add_host_entry() {
    IS_CLUSTER_SERVICE_UP=$(docker inspect -f {{.State.Running}} $CLUSTER_SERVICE_CONTAINER) || echo "'$CLUSTER_SERVICE_CONTAINER' container needs to be up for this operation."
    if [ "$IS_CLUSTER_SERVICE_UP" != "true" ]; then
        return -1
    else
        docker exec -t "$CLUSTER_SERVICE_CONTAINER" /bin/bash -c "echo $1 $2 >> /etc/hosts"
        echo "Successfully appended to '/etc/hosts'."
    fi
}

utils_update_user_secret() {
    if [[ $# -ne 1  || ( "$1" != "ambari" && "$1" != "atlas" && "$1" != "ranger" ) ]]; then
        echo "Invalid arguments."
        echo "Usage: dpdeploy.sh utils update-user [ambari | atlas | ranger]"
        return -1
    else
        update_user_entry "$@"
    fi
}

update_user_entry() {
    if [ "$MASTER_PASSWORD" == "" ]; then
        read_master_password
    fi
    source $(pwd)/keystore-manage.sh "$@"
}

utils_reload_app_containers() {
    # stop containers other than db, consul and knox
    docker stop $APP_CONTAINERS_WITHOUT_DB

    # start containers other than db, consul and knox
    echo "Starting Gateway"
    source $(pwd)/docker-gateway.sh

    echo "Starting DB Service"
    source $(pwd)/docker-service-db.sh

    echo "Starting Cluster Service"
    source $(pwd)/docker-service-cluster.sh

    echo "Starting Application API"
    source $(pwd)/docker-app.sh

    echo "Restart done."
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
    destroy_consul
}

init_app() {
    echo "Initializing app"
    read_consul_host

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

read_master_password() {
    echo "Enter master password for Data Plane Service: "
    read -s MASTER_PASSWD
    
    if [ "${#MASTER_PASSWD}" -lt 6 ]; then
        echo "Password needs to be at least 6 characters long."
        exit 1
    fi

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
    MASTER_PASSWORD="$MASTER_PASSWD"
}

read_admin_password_safely() {
    if [ -z "$USER_ADMIN_PASSWORD" ]; then
        read_admin_password
    fi
}

read_admin_password() {
    echo "Enter DataPlane admin password: "
    read -s ADMIN_PASSWD

    echo "Reenter password: "
    read -s ADMIN_PASSWD_VERIFY
    
    if [ "$ADMIN_PASSWD" != "$ADMIN_PASSWD_VERIFY" ];
    then
       echo "Password did not match. Reenter password:"
       read -s ADMIN_PASSWD_VERIFY
       if [ "$ADMIN_PASSWD" != "$ADMIN_PASSWD_VERIFY" ];
       then
        echo "Password did not match"
        exit 1
       fi
    fi
    USER_ADMIN_PASSWORD="$ADMIN_PASSWD"
}

read_user_supplied_certificate_password() {
    echo "Please enter password used for supplied certificates:"
    read -s CERTIFICATE_PASSWORD
}

read_use_test_ldap() {
    echo "Use pre-packaged LDAP instance (suitable only for testing) [yes/no]: "
    read USE_TEST_LDAP
}

import_certs() {
    if [ ! -e "$PUBLIC_KEY_L" ]; then
        echo "Public key file not found at $PUBLIC_KEY_L. Please try this command again after updating config.env.sh file with correct location."
        return -1
    fi
    if [ ! -e "$PRIVATE_KEY_L" ]; then
        echo "Private key file not found at $PRIVATE_KEY_L. Please try this command again after updating config.env.sh file with correct location."
        return -1
    fi

    mkdir -p certs
    rm -f $(pwd)/certs/ssl-cert.pem 2> /dev/null
    cp "$PUBLIC_KEY_L" $(pwd)/certs/ssl-cert.pem
    rm -f $(pwd)/certs/ssl-key.pem 2> /dev/null
    cp "$PRIVATE_KEY_L" $(pwd)/certs/ssl-key.pem

    echo "Certificates were copied successfully."

    read_user_supplied_certificate_password
}

init_certs() {
    if [ "$USE_TLS" != "true" ]; then
        USE_PROVIDED_CERTIFICATES="no"
    fi

    if [ "$USE_PROVIDED_CERTIFICATES" != "yes" ] && [ "$USE_PROVIDED_CERTIFICATES" != "no" ]; then
        echo "Do you have certificate to be configured? (yes/no):"
        read USE_PROVIDED_CERTIFICATES
    fi
    if [ "$USE_PROVIDED_CERTIFICATES" == "yes" ]; then
        echo "Importing certificates..."
        import_certs
    else
        echo "Generating self-signed certificates (for demo only)"
        generate_certs
    fi
}

read_certs_config() {
    if [ "$USE_TLS" != "true" ]; then
        USE_PROVIDED_CERTIFICATES="no"
    fi

    if [ "$USE_PROVIDED_CERTIFICATES" == "no" ]; then
        echo "Using previously generated self-signed certificates (for demo only)"
        CERTIFICATE_PASSWORD=${MASTER_PASSWORD}
    else
        read_user_supplied_certificate_password
    fi

}

init_knox_and_consul() {
    init_consul

    init_certs

    init_knox
}

init_knox() {
    echo "Initializing Knox"
    
    if [ "$MASTER_PASSWORD" == "" ]; then
        read_master_password
    fi
    if [ "$USE_TEST_LDAP" == "" ];then
        read_use_test_ldap
    fi
    
    echo "Starting Knox"
    source $(pwd)/docker-knox.sh
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

load_images() {
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

init_keystore() {
   if [ "$MASTER_PASSWORD" == "" ]; then
       read_master_password
   fi
    mkdir -p $(pwd)/certs
    source $(pwd)/keystore-initialize.sh
}

read_master_password_safely() {
   if [ "$MASTER_PASSWORD" == "" ]; then
       read_master_password
   fi
}

update_admin_password() {
    read_admin_password_safely
    source $(pwd)/database-user-update.sh "$USER_ADMIN_PASSWORD"
}

init_all() {
    read_admin_password_safely
    read_master_password_safely

    init_db
    reset_db

    update_admin_password

    init_knox_and_consul
    
    init_keystore

    init_app

    echo "Initialization and start complete."
}

init_all_from_state() {
    read_master_password_safely
    read_certs_config

    init_db

    init_consul

    init_knox

    init_app

    echo "Initialization and start complete."
}

start_all() {
    start_knox

    start_app

    echo "Start complete."
}

stop_all() {
    stop_app

    stop_knox

    echo "Stop complete."
}

destroy_volumes() {
    echo "Destroying volumes"
    docker volume rm knox-config knox-security postgresql-data
}

destroy_all_with_state() {
    destroy

    destroy_knox

    destroy_volumes

    echo "Destroy complete."
}

destroy_all_but_state() {
    destroy

    destroy_knox

    echo "Stop complete."
}

upgrade() {
    if [ $# -lt 2 ] || [ "$1" != "--from" ]; then
        usage
        exit -1
    fi

    if [ ! -d "$2" ]; then
        echo "Not a valid directory."
        exit -1
    fi

    echo "This will update database schema which can not be reverted. All backups need to made manually. Please confirm to proceed (yes/no):"
    read CONTINUE_MIGRATE
    if [ "$CONTINUE_MIGRATE" != "yes" ]; then
        exit -1
    fi

    source $(pwd)/config.clear.sh
    read_master_password_safely

    echo "Moving configuration..."
    mv $(pwd)/config.env.sh $(pwd)/config.env.sh.$(date +"%Y-%m-%d_%H-%M-%S").bak
    cp $2/config.env.sh $(pwd)/config.env.sh
    # sourcing again to overwrite values
    source $(pwd)/config.env.sh

    echo "Moving certs directory"
    mkdir -p $(pwd)/certs
    cp -R $2/certs/* $(pwd)/certs

    # destroy all but db
    docker rm -f $APP_CONTAINERS_WITHOUT_DB || echo "App is not up."
    
    echo "Destroying Knox"
    docker rm -f $KNOX_CONTAINER || echo "Knox is not up"

    # migrate schema to new version
    migrate_schema

    # upgrade certs if required
    read_certs_config

    # init all but db and consul
    read_consul_host

    init_knox
    init_app

    echo "Upgrade complete."
}

print_version() {
    if [ -f VERSION ]; then
        cat VERSION
    else
        echo ${DEFAULT_VERSION}
    fi
}

usage() {
    local tabspace=20
    echo "Usage: dpdeploy.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands"
    printf "%-${tabspace}s:%s\n" "init --all" "Initialize and start all containers for the first time"
    printf "%-${tabspace}s:%s\n" "migrate" "Run schema migrations on the DB"
    printf "%-${tabspace}s:%s\n" "utils update-user [ambari | atlas | ranger]" "Update user credentials for services that Dataplane will use to connect to clusters."
    printf "%-${tabspace}s:%s\n" "utils add-host <ip> <host>" "Append a single entry to /etc/hosts file of the container interacting with HDP clusters"
    printf "%-${tabspace}s:%s\n" "utils reload-apps" "Restart all containers other than database, Consul and Knox"
    printf "%-${tabspace}s:%s\n" "start" "Re-initialize all container while using previous data and state"
    printf "%-${tabspace}s:%s\n" "stop" "Destroy all containers but keep data and state"
    printf "%-${tabspace}s:%s\n" "ps" "List the status of the docker containers"
    printf "%-${tabspace}s:%s\n" "logs [container name]" "Logs of supplied container id or name"
    printf "%-${tabspace}s:%s\n" "metrics" "Print metrics for containers"
    printf "%-${tabspace}s:%s\n" "destroy" "Kill all containers and remove them. Needs to start from init db again"
    printf "%-${tabspace}s:%s\n" "destroy knox" "Kill Knox and Consul containers and remove them. Needs to start from init knox again"
    printf "%-${tabspace}s:%s\n" "destroy --all" "Kill all containers and remove them. Needs to start from init again"
    printf "%-${tabspace}s:%s\n" "load" "Load all images from lib directory into docker"
    printf "%-${tabspace}s:%s\n" "upgrade --from <old_setup_directory>" "Upgrade existing dp-core to current version"
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
                --all)
                    init_all
                    ;;
                *)
                    usage
                    ;;
            esac
            ;;
        migrate)
            reset_db
            ;;
        utils)
            shift
            case "$1" in
                add-host)
                    shift
                    utils_add_host "$@"
                    ;;
                update-user)
                    shift
                    utils_update_user_secret "$@"
                    ;;
                reload-apps)
                    utils_reload_app_containers
                    ;;
                *)
                    echo "Unknown option"
                    usage
                    ;;
            esac
            ;;
        start)
            init_all_from_state
            ;;
        stop)
            destroy_all_but_state
            ;;
        ps)
            ps
            ;;
        logs)
            shift
            list_logs "$@"
            ;;
        metrics)
            list_metrics
            ;;
        destroy)
            case "$2" in
                knox) destroy_knox
                ;;
                --all) destroy_all_with_state
                ;;
                *) destroy
                ;;
            esac
            ;;
        load)
            load_images
            ;;
        upgrade)
            shift
            upgrade "$@"
            ;;
        version)
            print_version
            ;;
        *)
            usage
            ;;
    esac
fi
