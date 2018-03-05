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
DSS_DEPLOY_COMMAND="./dssdeploy.sh"

print_one_line_usage() {
    local indentSpace=2
    local tabspace=60
    local extraIndentSpace=4
    local cmd_name=$1
    local cmd_help=$2
    local extraIndent=$3

    if [ "$extraIndent" == "true" ]; then
        printf "%-${extraIndentSpace}s%-58s%s\n" "" "${BRIGHT}${cmd_name}${NORMAL}" "${cmd_help}"
    else
        printf "%-${indentSpace}s%-${tabspace}s%s\n" "" "${BRIGHT}${cmd_name}${NORMAL}" "${cmd_help}"
    fi
}

print_detailed_usage() {
    if [ $# -eq 3 ]; then
        cmd_name="$1 $2"
        cmd_desc=$3
    else
        cmd_name=$1
        cmd_desc=$2
    fi
    printf "\nUsage:\t ${DSS_DEPLOY_COMMAND} ${cmd_name}\n"
    printf "\n${cmd_desc}\n"
}

all_usage(){
    printf "\n${UNDERLINE}Lifecycle Commands:${NORMAL}"
    printf "\nUsage: ${DSS_DEPLOY_COMMAND} COMMAND\n\n"
    print_one_line_usage "load" "Load packaged Docker images from binary tarballs to local Docker repository."
    print_one_line_usage "init" "Start the application docker containers for the first time"
    print_one_line_usage "start" "Start/Re-initialize all containers while using previous data and state if any"
    print_one_line_usage "stop"  "Destroy all containers but keeps data and state"
    print_one_line_usage "destroy" "Kill all containers and remove them. Needs to start from init again"
    print_one_line_usage "upgrade" "Upgrade existing DSS to latest version"

    printf "\n${UNDERLINE}Status Commands:${NORMAL}"
    printf "\nUsage: ${DSS_DEPLOY_COMMAND} COMMAND\n\n"
    print_one_line_usage "ps" "List the status of the DSS Docker containers"
    print_one_line_usage "logs [OPTIONS] CONTAINER" "Print logs of supplied container id or name"
    print_one_line_usage "version" "Print the version of DSS"

    printf "\nRun ${BRIGHT}'${DSS_DEPLOY_COMMAND} COMMAND --help'${NORMAL} for more information on Lifecycle and Status commands\n"
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
            print_detailed_usage "init" "Initialize and start all containers for the first time"
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
        destroy)
            print_detailed_usage "destroy" \
                "Kill all containers and remove them. User needs to start from ${DSS_DEPLOY_COMMAND} init again"
            ;;
        upgrade)
            print_detailed_usage "upgrade" "Upgrade existing DSS to latest available version"
            ;;
        version)
            print_detailed_usage "version" "Prints the version of DSS"
            ;;
        *)
            all_usage
            ;;
    esac
fi