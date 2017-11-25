#!/bin/sh
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

RELEASE_NUMBER=0.0.1-latest
IMAGE_PREFIX="hortonworks"
ALL_IMAGES="dp-knox dp-db-service dp-app dp-cluster-service dp-gateway dp-migrate"
VENDOR_IMAGES="postgres:9.6.3-alpine consul:1.0.1"
ALL_IMAGES_OPT="all"

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
    echo "Building dp-migrate"
    docker build -t ${IMAGE_PREFIX}/dp-migrate:${VERSION} build/dp-docker/dp-migrate
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

    if [ $1 == ${ALL_IMAGES_OPT} ]; then
        for img in ${ALL_IMAGES}
        do
            save_one_image ${img} ${IMAGE_PREFIX}/${img} ${VERSION} || \
                echo "Failed saving image ${img}, exiting. Verify if the image has been built."
        done
        save_vendor_images
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

save_vendor_images() {
    for img in ${VENDOR_IMAGES}
    do
        docker pull ${img} || \
            echo "Failed to pull image ${img}, exiting."
        save_one_image ${img////-} ${img} || \
                echo "Failed saving image ${img}, exiting. Verify if the image was available."
    done
}

package() {
    PACKAGE_NAME=dp-core
    BUILD_ROOT=$(pwd)/build
    PACKAGE_ROOT=$BUILD_ROOT/pkg/$PACKAGE_NAME

    echo "Starting docker build"
    ./dp-docker-build.sh build
    ./dp-docker-build.sh build knox

    echo "Exporting docker images"
    ./dp-docker-build.sh save all

    rm -rf $PACKAGE_ROOT
    
    echo "Preparing package dp-core"
    mkdir -p $PACKAGE_ROOT
    cp -R $BUILD_ROOT/dp-docker/installer $PACKAGE_ROOT/bin
    cp -R $BUILD_ROOT/dp-docker/images $PACKAGE_ROOT/lib

    echo "Creating archive for distribution"
    VERSION_STRING=$(cat $PACKAGE_ROOT/bin/VERSION)
    pushd $BUILD_ROOT/pkg
    tar -czf ${PACKAGE_NAME}-${VERSION_STRING}.tar.gz ${PACKAGE_NAME}
    popd

    echo "All done. Created $BUILD_ROOT/pkg/${PACKAGE_NAME}-${VERSION_STRING}.tar.gz"
}

get_version() {
    if [ -f build/dp-docker/installer/VERSION ]
    then
        VERSION_STRING=`cat build/dp-docker/installer/VERSION`
        echo ${VERSION_STRING}
    else
        echo ${RELEASE_NUMBER}
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
    printf "%-${tabspace}s:%s\n" "package" "Build all images and package them together"
        
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
        package)
            shift
            package
            ;;
        *)
            usage
            ;;
    esac
fi
