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
BRIGHT=$(tput bold)
NORMAL=$(tput sgr0)

set -e

source $(pwd)/config.env.sh

DEFAULT_VERSION=0.0.1-latest

CLUSTER_SERVICE_CONTAINER="dp-cluster-service"
DB_CONTAINER="dp-database"
APP_CONTAINERS_WITHOUT_DB="dp-app dp-db-service $CLUSTER_SERVICE_CONTAINER dp-gateway"
APP_CONTAINERS=$APP_CONTAINERS_WITHOUT_DB
if [ "$USE_EXTERNAL_DB" == "no" ]; then
    APP_CONTAINERS="$DB_CONTAINER $APP_CONTAINERS"
fi
KNOX_CONTAINER="knox"
CONSUL_CONTAINER="dp-consul-server"
CONSUL_HOST="$CONSUL_CONTAINER"

init_network() {
    IS_NETWORK_PRESENT="false"
    docker network inspect --format "{{title .ID}}" dp >> install.log 2>&1 && IS_NETWORK_PRESENT="true"
    if [ $IS_NETWORK_PRESENT == "false" ]; then
        echo "Network dp not found. Creating new network with name dp."
        docker network create dp
    fi
}

init_consul(){
    echo "Initializing Consul"
    source $(pwd)/docker-consul.sh
}

generate_certs() {
    CERTIFICATE_PASSWORD=${MASTER_PASSWORD}

    source $(pwd)/docker-certificates.sh
}

init_db() {
    if [ "$USE_EXTERNAL_DB" == "yes" ]; then
        echo "DataPlane Service is configured to use an external database in config.env.sh. Database initialization is not required and assumed to be done already."
    else
        source $(pwd)/docker-database.sh
    fi
}

ps() {
    docker ps \
        --filter "name=dp-app|dp-db-service|dp-cluster-service|dp-gateway|dp-database|knox|dp-consul-server|dp-migrate"
}

list_logs() {
    if [ $# -lt 1 ]; then
        source $(pwd)/help.sh "logs"
        exit -1;
    fi
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
    if [ "$USE_EXTERNAL_DB" == "no" ]; then
        # start database container
        source $(pwd)/docker-database.sh

        # wait for database start
        source $(pwd)/database-check.sh
    fi

    # start flyway container and trigger migrate script
    source $(pwd)/docker-flyway.sh migrate
}

reset_db() {
    if [ "$USE_EXTERNAL_DB" == "no" ]; then
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
        source $(pwd)/help.sh "utils" "add-host"
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
        source $(pwd)/help.sh "utils" "update-user"
        return -1
    else
        update_user_entry "$@"
    fi
}


get_master_password(){
    read -s -p "Enter previously entered master password for DataPlane Service: " MASTER_PASSWD
    MASTER_PASSWORD="$MASTER_PASSWD"
    echo
}

update_user_entry() {
    if [ "$MASTER_PASSWORD" == "" ]; then
        get_master_password
    fi
    source $(pwd)/keystore-manage.sh "$@"
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

    if [ "$USE_EXTERNAL_DB" == "no" ]; then
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
    printf "\nDataPlane Services will now setup a ${BRIGHT}Master password ${NORMAL} that is used to secure the secret storage for the system. \n"
    printf "\n${BRIGHT}Caution: ${NORMAL}The master password can be setup only once and cannot be reset easily. You will need to provide it for various admin operations. Hence please remember what you enter here.\n\n"
    read -s -p "Enter master password for DataPlane Service (Minimum 6 characters long): " MASTER_PASSWD
    echo

    if [ "${#MASTER_PASSWD}" -lt 6 ]; then
        echo "Password needs to be at least 6 characters long."
        exit 1
    fi

    read -s -p "Reenter password: " MASTER_PASSWD_VERIFY
    echo
    if [ "$MASTER_PASSWD" != "$MASTER_PASSWD_VERIFY" ];
    then
       read -s -p "Password did not match. Reenter password:" MASTER_PASSWD_VERIFY
       echo
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
    printf "\nDataPlane Services will now setup an ${BRIGHT}'admin' ${NORMAL}user who can configure LDAP, add other DataPlane Service Admins.\n"
    printf "Setup a password for this user.\n\n"
    read -s -p "Enter DataPlane Services admin password: " ADMIN_PASSWD
    echo
    read -s -p "Re-enter password: " ADMIN_PASSWD_VERIFY
    echo
    
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
    read -s -p "Please enter password used for supplied certificates:" CERTIFICATE_PASSWORD
}

read_use_test_ldap() {
    read -p "Use pre-packaged LDAP instance (suitable only for testing) [yes/no]: " USE_TEST_LDAP
}

import_certs() {
    if [ ! -e "$DATAPLANE_CERTIFICATE_PUBLIC_KEY_PATH" ]; then
        echo "Public key file not found at $DATAPLANE_CERTIFICATE_PUBLIC_KEY_PATH. Please try this command again after updating config.env.sh file with correct location."
        return -1
    fi
    if [ ! -e "$DATAPLANE_CERTIFICATE_PRIVATE_KEY_PATH" ]; then
        echo "Private key file not found at $DATAPLANE_CERTIFICATE_PRIVATE_KEY_PATH. Please try this command again after updating config.env.sh file with correct location."
        return -1
    fi

    mkdir -p certs
    rm -f $(pwd)/certs/ssl-cert.pem 2> /dev/null
    cp "$DATAPLANE_CERTIFICATE_PUBLIC_KEY_PATH" $(pwd)/certs/ssl-cert.pem
    rm -f $(pwd)/certs/ssl-key.pem 2> /dev/null
    cp "$DATAPLANE_CERTIFICATE_PRIVATE_KEY_PATH" $(pwd)/certs/ssl-key.pem

    echo "Certificates were copied successfully."

    read_user_supplied_certificate_password
}

init_certs() {
    if [ "$USE_TLS" != "true" ]; then
        USE_PROVIDED_CERTIFICATES="no"
    fi

    if [ "$USE_PROVIDED_CERTIFICATES" != "yes" ] && [ "$USE_PROVIDED_CERTIFICATES" != "no" ]; then
        read -p "Do you have certificate to be configured? (yes/no):" USE_PROVIDED_CERTIFICATES
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
        get_master_password
    fi
    if [ "$USE_TEST_LDAP" == "" ];then
        read_use_test_ldap
    fi
    
    echo "Starting Knox"
    source $(pwd)/docker-knox.sh
}

start_app() {
    if [ "$USE_EXTERNAL_DB" == "no" ]; then
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
       get_master_password
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
    source $(pwd)/database-run-script.sh "UPDATE_ADMIN_PASSWORD" "$USER_ADMIN_PASSWORD"
}

utils_enable_config_value() {
    if [ $# -ne 1 ]; then
        source $(pwd)/help.sh "utils" "enable-config"
        return -1
    else
        source $(pwd)/database-run-script.sh "ENABLE_CONFIG" "$@"
    fi
}

utils_disable_config_value() {
    if [ $# -ne 1 ]; then
        source $(pwd)/help.sh "utils" "disable-config"
        return -1
    else
        source $(pwd)/database-run-script.sh "DISABLE_CONFIG" "$@"
    fi
}

utils_get_config_value(){
    if [ $# -ne 1 ]; then
        source $(pwd)/help.sh "utils" "get-config"
        return -1
    else
        source $(pwd)/database-run-script.sh "GET_CONFIG" "$@"
    fi
}


init_all() {
    load_images
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
    get_master_password
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
        source $(pwd)/help.sh "upgrade"
        exit -1
    fi

    if [ ! -d "$2" ]; then
        echo "Not a valid directory."
        exit -1
    fi

    read -p "This will update database schema which can not be reverted. All backups need to made manually. Please confirm to proceed (yes/no):" CONTINUE_MIGRATE
    if [ "$CONTINUE_MIGRATE" != "yes" ]; then
        exit -1
    fi

    source $(pwd)/config.clear.sh
    get_master_password

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

do_confirm_stop(){
   printf "\n${BRIGHT}Warning!${NORMAL}\nThis command will stop all the DataPlane Services containers.\n\n"
   local option
   read -p "Do you want to continue? (yes/no): " option
   if [ "$option" == "yes" ]
    then
         destroy_all_but_state
    else
        printf "\nContainers are not stopped.\n"
        exit -1
    fi
}

do_confirm_destroy(){
   printf "\n${BRIGHT}Warning!${NORMAL}\nThis command will destroy all the DataPlane Services containers and the data associated with them. This action cannot be undone.\n\n"
   local option
   read -p "Do you want to continue? (yes/no): " option
   if [ "$option" == "yes" ]
    then
        destroy_all_with_state
    else
        printf "\nContainers are not destroyed.\n"
        exit -1
    fi
}

VERSION=$(print_version)
init_network

if [ $# -lt 1 ] || [ ${@:$#} == "--help" ]
then
    source $(pwd)/help.sh "$@"
    exit 0;
else
    case "$1" in
        # Adding load command temporarily to enable QE changes
        load)
            load_images
            ;;
        init)
            echo "Found $2"
            case "$2" in
                --all)
                    init_all
                    ;;
                *)
                    source $(pwd)/help.sh "$@"
                    ;;
            esac
            ;;
        start)
            init_all_from_state
            ;;
        stop)
            do_confirm_stop
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
                --all)
                    do_confirm_destroy
                    ;;
                *)
                    source $(pwd)/help.sh "$@"
                    ;;
            esac
            ;;
        upgrade)
            shift
            upgrade "$@"
            ;;
        version)
            print_version
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
                get-config)
                    shift
                    utils_get_config_value "$@"
                    ;;
                enable-config)
                    shift
                    utils_enable_config_value "$@"
                    ;;
                disable-config)
                    shift
                    utils_disable_config_value "$@"
                    ;;
                *)
                    echo "Unknown option"
                    source $(pwd)/help.sh "$@"
                    ;;
            esac
            ;;
        *)
            source $(pwd)/help.sh "$@"
            ;;
    esac
fi
