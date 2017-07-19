#!/bin/sh
set -e

RELEASE_NUMBER=0.0.1
IMAGE_PREFIX="hortonworks"
ALL_IMAGES="dp-knox dp-db-service dp-app dp-cluster-service dp-gateway"
ALL_IMAGES_OPT="all"
EXT_IMAGES="postgres:9.6.3-alpine consul:0.8.5 claycephas/flyway:4"

build_knox() {
    VERSION=$(get_version)
    docker build -t ${IMAGE_PREFIX}/dp-knox:${VERSION} build/dp-docker/dp-knox
}

build_images() {
    VERSION=$(get_version)
    echo "Using version ${VERSION}"
    echo "Building gateway"
    docker build -t ${IMAGE_PREFIX}/dp-gateway:${VERSION} build/dp-docker/dp-gateway/
    echo "Building dp-db-service"
    docker build -t ${IMAGE_PREFIX}/dp-db-service:${VERSION} build/dp-docker/dp-db-service/
    echo "Building dp-cluster-service"
    docker build -t ${IMAGE_PREFIX}/dp-cluster-service:${VERSION} build/dp-docker/dp-cluster-service
    echo "Building dp-app"
    docker build -t ${IMAGE_PREFIX}/dp-app:${VERSION} build/dp-docker/dp-app
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
            push_one_image ${IMAGE_PREFIX}/${img} ${VERSION} || \
                echo "Failed pushing image ${img}, exiting. Verify if you have logged in to docker-hub with a valid account."
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

save_images() {
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
            save_one_image ${img} ${IMAGE_PREFIX}/${img} ${VERSION} || \
                echo "Failed saving image ${img}, exiting. Verify if the image has been built."
        done
        for img in ${EXT_IMAGES}
        do
            docker pull ${img}
            save_one_image ${img} ${img} || \
                echo "Failed saving image ${img}, exiting. Verify if the image has been built."
        done
    else
        save_one_image $1 ${IMAGE_PREFIX}/${1} ${VERSION}
    fi
}

save_one_image() {
    IMAGE_LABEL=$1
    IMAGE_NAME=$2
    TAG=$3
    if [ ! -z ${TAG} ]
    then
        IMAGE_NAME=${IMAGE_NAME}:${TAG}
    fi
    echo "Saving ${IMAGE_NAME} to ./build/dp-docker/images/${IMAGE_LABEL}.tar"
    mkdir -p ./build/dp-docker/images
    docker save --output ./build/dp-docker/images/${IMAGE_LABEL}.tar ${IMAGE_NAME}
}

get_version() {
    if [ -f build/dp-docker/installer/VERSION ]
    then
        VERSION_STRING=`cat build/dp-docker/installer/VERSION`
        echo ${VERSION_STRING}
    else
        echo ${RELEASE_NUMBER}:"latest"
    fi
}

usage() {
    local tabspace=20
    echo "Usage: dp-docker-build.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands" "build [knox] | push all|<image-name>"
    printf "%-${tabspace}s:%s\n" "build" "Create images of Dataplane specific containers"
    printf "%-${tabspace}s:%s\n" "build knox" "Create Knox image for Dataplane"
    printf "%-${tabspace}s:%s\n" "push" "Push images to Hortonworks docker-hub account. Needs login to happen separately.
        all: Pushes all images
        <image-name>: Pushes a specific image"
    printf "%-${tabspace}s:%s\n" "save" "Saves all images to local tarballs.
        all: Saves all images
        <image-name>: Saves a specific image"
}

if [ $# -lt 1 ]
then
    usage;
    exit 0;
else
    case "$1" in
        build)
            if [ "$2" == "knox" ]
            then
                build_knox
            else
                build_images
            fi
            ;;
        push)
            shift
            push_images "$@"
            ;;
        save)
            shift
            save_images "$@"
            ;;
        *)
            usage
            ;;
    esac
fi
