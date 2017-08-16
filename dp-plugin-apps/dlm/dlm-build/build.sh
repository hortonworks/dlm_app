#!/usr/bin/env bash

#
# Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
#
# Except as expressly permitted in a written agreement between you or your company
# and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
# reproduction, modification, redistribution, sharing, lending or other exploitation
# of all or any part of the contents of this software is strictly prohibited.
#

set -e

DLM_DOCKER_ROOT_FOLDER=build/dlm-docker
RELEASE_NUMBER=0.0.1
IS_JENKINS=false

log() {
	echo $@
}

clean_build() {
	rm -rf build
	mkdir -p ${DLM_DOCKER_ROOT_FOLDER}/dlm-app/dlm-web
	mkdir -p ${DLM_DOCKER_ROOT_FOLDER}/installer
}

unpack_for_docker_deploy() {
	log "Unzip to " $1
	log "Copy to " $2
	unzip `find ./target/universal -maxdepth 1 -type f -name *.zip|head -1` -d $1
	cp -R `ls -d $1/*/ | head -n 1` $2
}

build_dlm() {
  if [ ${IS_JENKINS} == false ]; then
    log "Building dlm"
    pushd ..
    sbt dist
    popd
  else
    echo "Not building DLM again in Jenkins"
  fi

}

build_dlm_app() {
	log "Building dlm-app"
	pushd ../dlm-app
	unpack_for_docker_deploy ../dlm-build/build/tmp_dlm-app ../dlm-build/${DLM_DOCKER_ROOT_FOLDER}/dlm-app/dlm-app
	cp -R ../dlm-build/services ../dlm-build/${DLM_DOCKER_ROOT_FOLDER}/dlm-app/
	cp ../dlm-build/Dockerfile ../dlm-build/${DLM_DOCKER_ROOT_FOLDER}/dlm-app/
	popd
}

build_dlm_web() {
	log "Building dlm-web"
	pushd ../dlm-web
	if [ ${IS_JENKINS} == false ]; then
		mvn clean test -DskipTests
	else
		echo "Not running dlm-web build again"
	fi
	cp -R ./dist/* ../dlm-build/${DLM_DOCKER_ROOT_FOLDER}/dlm-app/dlm-web
	popd
}

build_installer() {
	log "Building installer"
	cp -R install/* ${DLM_DOCKER_ROOT_FOLDER}/installer
	cp dlm-docker-build.sh ${DLM_DOCKER_ROOT_FOLDER}/installer/
	VERSION_STRING=$(get_version)
	echo ${VERSION_STRING} > ${DLM_DOCKER_ROOT_FOLDER}/installer/VERSION
}

get_version() {
	if [ -z ${BUILD_NUMBER} ]
	then
		echo "${RELEASE_NUMBER}-latest"
	else
		echo "${RELEASE_NUMBER}-${BUILD_NUMBER}"
	fi
}

zip_dlm_binaries() {
	pushd build
	VERSION_STRING=$(get_version)
	tar -czf dlm-docker-${VERSION_STRING}.tar.gz dlm-docker
	popd
	pushd ${DLM_DOCKER_ROOT_FOLDER}
	tar -czf dlm-installer-${VERSION_STRING}.tar.gz installer/*
	popd
}

log "Current working directory is: " `pwd`
if [ "$1" == "Jenkins" ]; then
	IS_JENKINS=true
	echo "Running in Jenkins, IS_JENKINS=${IS_JENKINS}"
else
	echo "Running regular build, IS_JENKINS=${IS_JENKINS}"
fi

clean_build
build_dlm
build_dlm_app
build_dlm_web
build_installer
zip_dlm_binaries
log "All done"
