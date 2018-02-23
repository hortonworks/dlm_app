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
OPTION_INDENDSPACE=2
DP_DEPLOY_COMMAND="./dpdeploy.sh"

all_usage(){
    local indendSpace=2
    local tabspace=50

    printf "\n${UNDERLINE}Lifecycle Commands:${NORMAL}"
    printf "\nUsage: ${DP_DEPLOY_COMMAND} COMMAND\n\n"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}init --all${NORMAL}" "Initialize and start all containers for the first time"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}start${NORMAL}" "Re-initialize all containers while using previous data and state"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}stop${NORMAL}" "Destroy all containers but keeps data and state"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}destroy --all${NORMAL}" "Kill all containers and remove them. Needs to start from init again"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}upgrade --from <old_setup_directory>${NORMAL}" "Upgrade existing dp-core to current version"

    printf "\n${UNDERLINE}Status Commands:${NORMAL}"
    printf "\nUsage: ${DP_DEPLOY_COMMAND} COMMAND\n\n"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}ps${NORMAL}" "List the status of the docker containers"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}logs [OPTIONS] CONTAINER${NORMAL}" "Logs of supplied container id or name"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}metrics${NORMAL}" "Print metrics for containers"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}version${NORMAL}" "Print the version of DataPlane Service"

    printf "\n${UNDERLINE}Utility Commands:${NORMAL}"
    printf "\nUsage: ${DP_DEPLOY_COMMAND} utils COMMAND\n\n"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}get-config <key>${NORMAL}" "Gets config value for the given config key"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}enable-config <key>${NORMAL}" "Sets config value to true for the given config key"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}disable-config <key>${NORMAL}" "Sets config value to false for the given config key"
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}update-user [ambari | atlas | ranger]${NORMAL}" "Update user credentials for services that DataPlane will use to connect to clusters."
    printf "%-${indendSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}add-host <ip> <host>${NORMAL}" "Append a single entry to /etc/hosts file of the container interacting with HDP clusters"

    printf "\nRun ${BRIGHT}'${DP_DEPLOY_COMMAND} COMMAND --help'${NORMAL} for more information on Lifecycle and Status commands"
    printf "\nRun ${BRIGHT}'${DP_DEPLOY_COMMAND} utils COMMAND --help'${NORMAL} for more information on utility commands\n"
}
if [ $# -lt 1 ]
then
    all_usage;
else
    case "$1" in
        --help)
           all_usage;
            ;;
        init)
            printf "\nUsage:\t ${DP_DEPLOY_COMMAND} init --all\n"
            printf "\nInitialize and start all containers for the first time\n"
            ;;
        start)
            printf "\nUsage:\t ${DP_DEPLOY_COMMAND} start\n"
            printf "\nRe-initialize all containers while using previous data and state\n"
            ;;
        stop)
            printf "\nUsage:\t ${DP_DEPLOY_COMMAND} stop\n"
            printf "\nDestroy all containers but keeps data and state\n"
            ;;
        ps)
            printf "\nUsage:\t ${DP_DEPLOY_COMMAND} ps\n"
            printf "\nList the status of the docker containers\n"
            ;;
        logs)
            printf "\nUsage:\t ${DP_DEPLOY_COMMAND} logs [OPTIONS] CONTAINER\n"
            printf "\nPrints logs of supplied container id or name\n"
            printf "\nOptions:"
            printf "\n%-${OPTION_INDENDSPACE}s%-4s%-36s%s\n" "" "" "--details" "Show extra details provided to logs"
            printf "%-${OPTION_INDENDSPACE}s%-${OPTION_TABSPACE}s%s\n" "" "-f, --follow" "Follow log output"
            printf "%-${OPTION_INDENDSPACE}s%-4s%-36s%s\n" "" "" "--since string" "Show logs since timestamp (e.g. 2013-01-02T13:23:37) or relative (e.g. 42m for 42 minutes)"
            printf "%-${OPTION_INDENDSPACE}s%-4s%-36s%s\n" "" "" "--tail string" "Number of lines to show from the end of the logs (default 'all')"
            printf "%-${OPTION_INDENDSPACE}s%-${OPTION_TABSPACE}s%s\n" "" "-t, --timestamps" "Show timestamps"
            printf "%-${OPTION_INDENDSPACE}s%-4s%-36s%s\n" "" "" "--until string" "Show logs before a timestamp (e.g. 2013-01-02T13:23:37) or relative (e.g. 42m for 42 minutes)"
            ;;
        metrics)
            printf "\nUsage:\t ${DP_DEPLOY_COMMAND} metrics\n"
            printf "\nPrints the metrics for containers\n"
            ;;
        destroy)
            printf "\nUsage:\t ${DP_DEPLOY_COMMAND} destroy --all\n"
            printf "\nKill all containers and remove them. Needs to start from init again\n"
            ;;
        upgrade)
            printf "\nUsage:\t ${DP_DEPLOY_COMMAND} upgrade --from <old_setup_directory>\n"
            printf "\nUpgrade existing dp-core to current version\n"
            ;;
        version)
            printf "\nUsage:\t ${DP_DEPLOY_COMMAND} version\n"
            printf "\nPrints the version of DataPlane Service\n"
            ;;
        utils)
            shift
            case "$1" in
                add-host)
                    printf "\nUsage: dpdeploy.sh utils add-host <ip> <host>\n"
                    printf "\nAppends a single entry to /etc/hosts file of the container interacting with HDP clusters\n"
                    ;;
                update-user)
                    printf "\nUsage: dpdeploy.sh utils update-user [ambari | atlas | ranger]\n"
                    printf "\nUpdate user credentials for services that DataPlane will use to connect to clusters. The available options are ambari, atlas, ranger\n"
                    ;;
                get-config)
                    printf "\nUsage: dpdeploy.sh utils get-config <key>\n"
                    printf "\nPrints the configuration value for the given configuration key\n"
                    ;;
                enable-config)
                    printf "\nUsage: dpdeploy.sh utils enable-config <key>\n"
                    printf "\nSets config value to true for the given configuration key\n"
                    ;;
                disable-config)
                    printf "\nUsage: dpdeploy.sh utils disable-config <key>\n"
                    printf "\nSets config value to false for the given configuration key\n"
                    ;;
                *)
                    printf "Unknown option"
                    all_usage
                    ;;
            esac
            ;;
        *)
            all_usage
            ;;
    esac
fi