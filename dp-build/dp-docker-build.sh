#!/bin/sh
set -e

IMAGE_PREFIX="hortonworks"
ALL_IMAGES="dp-knox dp-db-service dp-app dp-cluster-service dp-gateway"
ALL_IMAGES_OPT="all"

build_images() {
    VERSION=$(get_version)
    echo "Using version ${VERSION}"
    echo "Building gateway"
    docker build -t hortonworks/dp-gateway:${VERSION} build/dp-docker/dp-gateway/
    echo "Building dp-db-service"
    docker build -t hortonworks/dp-db-service:${VERSION} build/dp-docker/dp-db-service/
    echo "Building dp-cluster-service"
    docker build -t hortonworks/dp-cluster-service:${VERSION} build/dp-docker/dp-cluster-service
    echo "Building dp-app"
    docker build -t hortonworks/dp-app:${VERSION} build/dp-docker/dp-app
    echo "Building dp-knox"
    docker build -t hortonworks/dp-knox:${VERSION} build/dp-docker/dp-knox
}

push_images() {
    if [ $# -lt 1 ]
    then
        usage
        return -1
    fi

    VERSION=$(get_version)

    if [ $1 == ${ALL_IMAGES_OPT} ]
    then
        for img in ${ALL_IMAGES}
        do
            push_one_image ${IMAGE_PREFIX}/${img} ${VERSION}
            if [ $? -ne 0 ]
            then
                echo "Failed pushing image ${img}, exiting. Verify if you have logged in to docker-hub with a valid account."
                return -1
            fi
        done
    else
        push_one_image $1 ${VERSION}
    fi
}

push_one_image() {
    IMAGE_NAME=$1
    TAG=$2
    if [ ! -z ${TAG} ]
    then
        IMAGE_NAME=$1:${TAG}
    fi
    echo "Pushing ${IMAGE_NAME}"
    docker push ${IMAGE_NAME}
}

get_version() {
    if [ -f build/dp-docker/installer/VERSION ]
    then
        VERSION_STRING=`cat build/dp-docker/installer/VERSION`
        echo ${VERSION_STRING}
    else
        echo "Unable to find VERSION file."
        exit 0
    fi
}

usage() {
    local tabspace=20
    echo "Usage: dp-docker-build.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands" "build | push all|<image-name>"
    printf "%-${tabspace}s:%s\n" "build" "Create images of Dataplane specific containers"
    printf "%-${tabspace}s:%s\n" "push" "Push images to Hortonworks docker-hub account. Needs login to happen separately.
        all: Pushes all images
        <image-name>: Pushes a specific image"
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
            push_images "$@"
            ;;
        *)
            usage
            ;;
    esac
fi
