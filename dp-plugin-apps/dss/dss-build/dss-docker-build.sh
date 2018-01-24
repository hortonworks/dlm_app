#!/bin/sh

#
# Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
#
# Except as expressly permitted in a written agreement between you or your company
# and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
# reproduction, modification, redistribution, sharing, lending or other exploitation
# of all or any part of the contents of this software is strictly prohibited.
#

set -e

RELEASE_NUMBER=0.0.1-latest
IMAGE_PREFIX="hortonworks"
IMG="dss-app"


build_images() {
    VERSION=$(get_version)
    echo "Using version ${VERSION}"
    echo "Building dss-app"
    docker build -t hortonworks/dss-app:${VERSION} build/dss-docker/dss-app
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

save_image() {
    VERSION=$(get_version)
    IMAGE_NAME=${IMAGE_PREFIX}/${IMG}:${VERSION}
    echo "Saving ${IMAGE_PREFIX}/${IMG} to ./build/dss-docker/images/${IMG}.tar"
    mkdir -p ./build/dss-docker/images
    docker save --output ./build/dss-docker/images/${IMG}.tar ${IMAGE_NAME}
}

package() {
    PACKAGE_NAME=dss
    BUILD_ROOT=$(pwd)/build
    PACKAGE_ROOT=$BUILD_ROOT/pkg/$PACKAGE_NAME

    echo "Starting docker build"
    dss-docker-build.sh build

    echo "Exporting docker images"
    dss-docker-build.sh save

    rm -rf $PACKAGE_ROOT
    
    echo "Preparing package dss"
    mkdir -p $PACKAGE_ROOT
    cp -R $BUILD_ROOT/dss-docker/installer $PACKAGE_ROOT/bin
    cp -R $BUILD_ROOT/dss-docker/images $PACKAGE_ROOT/lib

    echo "Creating archive for distribution"
    VERSION_STRING=$(cat $PACKAGE_ROOT/bin/VERSION)
    pushd $BUILD_ROOT/pkg
    tar -czf ${PACKAGE_NAME}-${VERSION_STRING}.tar.gz ${PACKAGE_NAME}
    popd

    echo "All done. Created $BUILD_ROOT/pkg/${PACKAGE_NAME}-${VERSION_STRING}.tar.gz"
}

get_version() {
    if [ -f build/dss-docker/installer/VERSION ]
    then
        VERSION_STRING=`cat build/dss-docker/installer/VERSION`
        echo ${VERSION_STRING}
    else
        echo ${RELEASE_NUMBER}
    fi
}

usage() {
    local tabspace=20
    echo "Usage: dss-docker-build.sh <command>"
    printf "%-${tabspace}s:%s\n" "Commands" "build | push"
    printf "%-${tabspace}s:%s\n" "build" "Create Data Steward Studio app image"
    printf "%-${tabspace}s:%s\n" "save" "Save Data Steward Studio app image"
    printf "%-${tabspace}s:%s\n" "push" "Push Data Steward Studio image to Hortonworks docker-hub account. Needs login to happen separately."
    printf "%-${tabspace}s:%s\n" "package" "Package Data Steward Studio for distribution"
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
        save)
            shift
            save_image
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
