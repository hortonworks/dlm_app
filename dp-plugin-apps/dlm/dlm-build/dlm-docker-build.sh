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

save_image() {
    VERSION=$(get_version)
    IMAGE_NAME=${IMAGE_PREFIX}/${IMG}:${VERSION}
    echo "Saving ${IMAGE_PREFIX}/${IMG} to ./build/dlm-docker/images/${IMG}.tar"
    mkdir -p ./build/dlm-docker/images
    docker save --output ./build/dlm-docker/images/${IMG}.tar ${IMAGE_NAME}
}

package() {
    PACKAGE_NAME=dlm
    BUILD_ROOT=$(pwd)/build
    PACKAGE_ROOT=$BUILD_ROOT/pkg/$PACKAGE_NAME

    echo "Starting docker build"
    ./dlm-docker-build.sh build

    echo "Exporting docker images"
    ./dlm-docker-build.sh save

    rm -rf $PACKAGE_ROOT
    
    echo "Preparing package dlm"
    mkdir -p $PACKAGE_ROOT
    cp -R $BUILD_ROOT/dlm-docker/installer $PACKAGE_ROOT/bin
    cp -R $BUILD_ROOT/dlm-docker/images $PACKAGE_ROOT/lib

    echo "Creating archive for distribution"
    VERSION_STRING=$(cat $PACKAGE_ROOT/bin/VERSION)
    pushd $BUILD_ROOT/pkg
    tar -czf ${PACKAGE_NAME}-${VERSION_STRING}.tar.gz ${PACKAGE_NAME}
    popd

    echo "All done. Created $BUILD_ROOT/pkg/${PACKAGE_NAME}-${VERSION_STRING}.tar.gz"
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
    printf "%-${tabspace}s:%s\n" "save" "Save DLM app image"
    printf "%-${tabspace}s:%s\n" "push" "Push dlm image to Hortonworks docker-hub account. Needs login to happen separately."
    printf "%-${tabspace}s:%s\n" "package" "Package DLM for distribution"
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
