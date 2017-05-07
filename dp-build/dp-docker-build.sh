#!/bin/sh
set -e

IMAGE_PREFIX="hortonworks"
ALL_IMAGES="dp-knox dp-db-service dp-app dp-cluster-service"
ALL_IMAGES_OPT="all"

build_knox() {
    docker build -f Dockerfile.knox -t hortonworks/dp-knox .
}

build_images() {
    echo "Building dp-db-service"
    docker build -t hortonworks/dp-db-service ../services/db-service
    echo "Building dp-cluster-service"
    docker build -t hortonworks/dp-cluster-service ../services/cluster-service
    echo "Building dp-app"
    docker build -t hortonworks/dp-app .
}

push_images() {
    if [ $# -lt 1 ]
    then
        usage
        return -1
    fi

    TAG=""
    if [ $# -eq 2 ]
    then
        TAG=$2
    fi

    if [ $1 == ${ALL_IMAGES_OPT} ]
    then
        for img in ${ALL_IMAGES}
        do
            push_one_image ${IMAGE_PREFIX}/${img} ${TAG}
            if [ $? -ne 0 ]
            then
                echo "Failed pushing image ${img}, exiting. Verify if you have logged in to docker-hub with a valid account."
                return -1
            fi
        done
    else
        push_one_image $1 ${TAG}
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
    docker push ${IMAGE_NAME};
}

usage() {
    echo "Usage: dp-docker-build.sh <command> \\n \
            Commands: build [knox] | push all|<image-name> [tag] \\n \
            build: Create images of Dataplane specific containers \\n \
            build knox: Create Knox image for Dataplane \\n \
            push: Push images to Hortonworks docker-hub account. Needs login to happen separately. \\n \
                    all [tag]: Pushes all images with an optionally specified tag. \\n \
                    <image-name> [tag]: Pushes a specific image with an optionally specified tag.
            "
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
        *)
            usage
            ;;
    esac
fi