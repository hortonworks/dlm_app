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

BRIGHT=$(tput bold)
NORMAL=$(tput sgr0)
UNDERLINE=$(tput smul)
OPTION_TABSPACE=40
OPTION_INDENTSPACE=2
DP_DEPLOY_COMMAND="./dpdeploy.sh"

print_one_line_usage() {
    local indentSpace=2
    local tabspace=60
    local cmd_name=$1
    local cmd_help=$2
    printf "%-${indentSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}${cmd_name}${NORMAL}" "${cmd_help}"
}

print_detailed_usage() {
    if [ $# -eq 3 ]; then
        cmd_name="$1 $2"
        cmd_desc=$3
    else
        cmd_name=$1
        cmd_desc=$2
    fi
    printf "\nUsage:\t ${DP_DEPLOY_COMMAND} ${cmd_name}\n"
    printf "\n${cmd_desc}\n"
}

show_config_help() {
    echo
    print_one_line_usage "USE_EXTERNAL_DB" "Set to yes for pointing to an external Postgres instance, no otherwise. Defaults to no"
    printf "\n%-${OPTION_INDENTSPACE}s%-2s%-58s%s\n" "" "" "${BRIGHT}DATABASE_URI${NORMAL}" "If USE_EXTERNAL_DB is yes, this must point to the external Database URI"
    printf "\n%-${OPTION_INDENTSPACE}s%-2s%-58s%s\n" "" "" "${BRIGHT}DATABASE_USER${NORMAL}" "If USE_EXTERNAL_DB is yes, this must point to the Dataplane Admin user name of the external Database URI"
    printf "\n%-${OPTION_INDENTSPACE}s%-2s%-58s%s\n" "" "" "${BRIGHT}DATABASE_PASS${NORMAL}" "If USE_EXTERNAL_DB is yes, this must point to the Dataplane Admin password of the external Database URI. This is either using Ambari credentials"
    print_one_line_usage "" "or explicitly specifying the URL. Set to true if you want to use Ambari credentials, false for URL. Defaults to true"
    echo
    print_one_line_usage "USE_TEST_LDAP" "Specifies whether to use an external LDAP instance or connect to a test LDAP instance that comes with the Dataplane Knox container"
    echo
    print_one_line_usage "USE_TLS" "Set to true to enable TLS / HTTPS"
    echo
    print_one_line_usage "USE_PROVIDED_CERTIFICATES" "Set to yes if you have public-private key-pair already generated/issued. Setting to no automatically generates a key-pair for you."
    printf "\n%-${OPTION_INDENTSPACE}s%-2s%-58s%s\n" "" "" "${BRIGHT}DATAPLANE_CERTIFICATE_PUBLIC_KEY_PATH${NORMAL}" "If USE_PROVIDED_CERTIFICATES is yes, this must point to the absolute path of public key file"
    printf "\n%-${OPTION_INDENTSPACE}s%-2s%-58s%s\n" "" "" "${BRIGHT}DATAPLANE_CERTIFICATE_PRIVATE_KEY_PATH${NORMAL}" "If USE_PROVIDED_CERTIFICATES is yes, this must point to the absolute path of encrypted private key file"

}

all_usage(){
    printf "\n${UNDERLINE}Lifecycle Commands:${NORMAL}"
    printf "\nUsage: ${DP_DEPLOY_COMMAND} COMMAND\n\n"
    print_one_line_usage "load" "Load packaged Docker images from binary tarballs to local Docker repository."
    print_one_line_usage "init --all" "Initialize and start all containers for the first time"
    print_one_line_usage "start" "Re-initialize all containers while using previous data and state"
    print_one_line_usage "stop"  "Destroy all containers but keeps data and state"
    print_one_line_usage "destroy --all" "Kill all containers and remove them. Needs to start from init again"
    print_one_line_usage "upgrade --from <old_setup_directory>" "Upgrade existing dp-core to latest version"

    printf "\n${UNDERLINE}Status Commands:${NORMAL}"
    printf "\nUsage: ${DP_DEPLOY_COMMAND} COMMAND\n\n"
    print_one_line_usage "ps" "List the status of the DataPlane Docker containers"
    print_one_line_usage "logs [OPTIONS] CONTAINER" "Print logs of supplied container id or name"
    print_one_line_usage "metrics" "Print metrics for DataPlane containers"
    print_one_line_usage "version" "Print the version of DataPlane Service"

    printf "\n${UNDERLINE}Utility Commands:${NORMAL}"
    printf "\nUsage: ${DP_DEPLOY_COMMAND} utils COMMAND\n\n"
    print_one_line_usage "get-config <key>" "Gets config value for the given config key"
    print_one_line_usage "enable-config <key>" "Sets config value to true for the given config key"
    print_one_line_usage "disable-config <key>" "Sets config value to false for the given config key"
    print_one_line_usage "update-user [ambari | atlas | ranger]" "Update user credentials for services that DataPlane will use to connect to clusters."
    print_one_line_usage "add-host <ip> <host>" "Append a single entry to /etc/hosts file of the container interacting with HDP clusters"

    printf "\nRun ${BRIGHT}'${DP_DEPLOY_COMMAND} COMMAND --help'${NORMAL} for more information on Lifecycle and Status commands"
    printf "\nRun ${BRIGHT}'${DP_DEPLOY_COMMAND} utils COMMAND --help'${NORMAL} for more information on utility commands"
    printf "\nRun ${BRIGHT}'${DP_DEPLOY_COMMAND} config --help'${NORMAL} for more information on configurations\n"
}

if [ $# -lt 1 ]
then
    all_usage;
else
    case "$1" in
        --help)
           all_usage;
            ;;
        load)
            print_detailed_usage "load" "Load packaged Docker images from binary tarballs to local Docker repository."
            ;;
        init)
            print_detailed_usage "init --all" "Initialize and start all containers for the first time"
            ;;
        start)
            print_detailed_usage "start" "Re-initialize all containers while using previous data and state"
            ;;
        stop)
            print_detailed_usage "stop" "Destroy all containers but keeps data and state"
            ;;
        ps)
            print_detailed_usage "ps" "List the status of the docker containers"
            ;;
        logs)
            print_detailed_usage "logs [OPTIONS] CONTAINER" "Prints logs of supplied container id or name"
            printf "\nOptions:"
            printf "\n%-${OPTION_INDENTSPACE}s%-4s%-36s%s\n" "" "" "--details" "Show extra details provided to logs"
            printf "%-${OPTION_INDENTSPACE}s%-${OPTION_TABSPACE}s%s\n" "" "-f, --follow" "Follow log output"
            printf "%-${OPTION_INDENTSPACE}s%-4s%-36s%s\n" "" "" "--since string" "Show logs since timestamp (e.g. 2013-01-02T13:23:37) or relative (e.g. 42m for 42 minutes)"
            printf "%-${OPTION_INDENTSPACE}s%-4s%-36s%s\n" "" "" "--tail string" "Number of lines to show from the end of the logs (default 'all')"
            printf "%-${OPTION_INDENTSPACE}s%-${OPTION_TABSPACE}s%s\n" "" "-t, --timestamps" "Show timestamps"
            printf "%-${OPTION_INDENTSPACE}s%-4s%-36s%s\n" "" "" "--until string" "Show logs before a timestamp (e.g. 2013-01-02T13:23:37) or relative (e.g. 42m for 42 minutes)"
            ;;
        metrics)
            print_detailed_usage "metrics" "Prints the metrics for DataPlane containers"
            ;;
        destroy)
            print_detailed_usage "destroy --all" \
                "Kill all containers and remove them. User needs to start from ${DP_DEPLOY_COMMAND} init again"
            ;;
        upgrade)
            print_detailed_usage "upgrade --from <old_setup_directory>" "Upgrade existing dp-core to latest available version"
            ;;
        version)
            print_detailed_usage "version" "Prints the version of DataPlane Service"
            ;;
        utils)
            shift
            case "$1" in
                add-host)
                    print_detailed_usage "utils" "add-host <ip> <host>" \
                        "Appends a single entry to /etc/hosts file of the container interacting with HDP clusters"
                    ;;
                update-user)
                    print_detailed_usage "utils" "update-user [ambari | atlas | ranger]" \
                        "Update user credentials for services that DataPlane will use to connect to clusters. The available options are ambari, atlas, ranger"
                    ;;
                get-config)
                    print_detailed_usage "utils" "get-config <key>" \
                        "Prints the configuration value for the given configuration key"
                    ;;
                enable-config)
                    print_detailed_usage "utils" "enable-config <key" \
                        "Sets config value to true for the given configuration key"
                    ;;
                disable-config)
                    print_detailed_usage "utils" "disable-config <key>" \
                        "Sets config value to false for the given configuration key"
                    ;;
                *)
                    printf "Unknown option"
                    all_usage
                    ;;
            esac
            ;;
        config)
            show_config_help
            ;;
        *)
            all_usage
            ;;
    esac
fi