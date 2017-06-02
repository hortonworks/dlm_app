#!/bin/sh
set -e

RELEASE_NUMBER=0.0.1
IMAGE_PREFIX="hortonworks"
IMG="dlm-app"


build_images() {
    VERSION=$(get_version)
    echo "Using version ${VERSION}"
    echo "Building dlm-app"
    docker build -t hortonworks/dlm-app:${VERSION} build/dlm-docker/dlm-app
}

push_image() {
    VERSION=$(get_version)
    IMAGE_NAME=${IMAGE_PREFIX}/${IMG}:${VERSION}
    echo "Pushing ${IMAGE_NAME}"
    docker push ${IMAGE_NAME}
    if [ $? -ne 0 ]
    then
       echo "Failed pushing image ${IMG}, exiting. Verify if you have logged in to docker-hub with a valid account."
       return -1
    fi
           
}

get_version() {
    if [ -f build/dlm-docker/installer/VERSION ]
    then
        VERSION_STRING=`cat build/dlm-docker/installer/VERSION`
        echo ${VERSION_STRING}
    else
        echo ${RELEASE_NUMBER}:"latest"
    fi
}

usage() {
    local tabspace=20
    echo "Usage: dlm-docker-build.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands" "build | push"
    printf "%-${tabspace}s:%s\n" "build" "Create DLM app image"
    printf "%-${tabspace}s:%s\n" "push" "Push dlm image to Hortonworks docker-hub account. Needs login to happen separately."
}

if [ $# -lt 1 ]
then
    usage;
    exit 0;
else
    case "$1" in
        build)
            build_images
            ;;
        push)
            shift
            push_image "$@"
            ;;
        *)
            usage
            ;;
    esac
fi
