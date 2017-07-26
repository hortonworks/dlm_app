#!/bin/sh

docker info &> /dev/null
IS_DOCKER_READY=$?

set -e

PACKAGE_NAME=dp-core
BUILD_ROOT=$(pwd)/build
PACKAGE_ROOT=$BUILD_ROOT/pkg/$PACKAGE_NAME

echo "Starting build"
./build.sh

if [ "$IS_DOCKER_READY" != 0 ]; then
	echo "Unable to connect to docker-daemon. Please ensure it is running and accessible."
	exit 1
fi

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

echo "All done. Created $BUILD_ROOT/${PACKAGE_NAME}-${VERSION_STRING}.tar.gz"


