#!/usr/bin/env bash
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

DSS_DOCKER_ROOT_FOLDER=build/dss-docker
RELEASE_NUMBER=0.0.1
IS_JENKINS=false

log() {
	echo $@
}

clean_build() {
	rm -rf build
	mkdir -p ${DSS_DOCKER_ROOT_FOLDER}/dss-app/dss-web
	mkdir -p ${DSS_DOCKER_ROOT_FOLDER}/installer
}

build_dss() {
  if [ ${IS_JENKINS} == false ]; then
    log "Building dss"
    pushd ..
    sbt dist
    popd
  else
    echo "Not building DSS again in Jenkins"
  fi

}

unpack_for_docker_deploy() {
	log "Unzip to " $1
	log "Copy to " $2
	unzip `find ./target/universal -maxdepth 1 -type f -name *.zip|head -1` -d $1
	cp -R `ls -d $1/*/ | head -n 1` $2
}

build_dss_app() {
	log "Building dss-app"
	pushd ../dss-app
	unpack_for_docker_deploy ../dss-build/build/tmp_dss-app ../dss-build/${DSS_DOCKER_ROOT_FOLDER}/dss-app/dss-app
	cp -R ../dss-build/services ../dss-build/${DSS_DOCKER_ROOT_FOLDER}/dss-app/
	cp ../dss-build/Dockerfile ../dss-build/${DSS_DOCKER_ROOT_FOLDER}/dss-app/
	popd
}

build_dss_web() {
  log "Building dss-web"
	pushd ../dss-web
	if [ ${IS_JENKINS} == false ]; then
		yarn install
		yarn run build
	else
		echo "Not running dp-web NPM again"
	fi
	cp -R ./dist/* ../dss-build/${DSS_DOCKER_ROOT_FOLDER}/dss-app/dss-web
	popd
}

build_installer() {
	log "Building installer"
	cp -R install/* ${DSS_DOCKER_ROOT_FOLDER}/installer
	cp dss-docker-build.sh ${DSS_DOCKER_ROOT_FOLDER}/installer/
	VERSION_STRING=$(get_version)
	echo ${VERSION_STRING} > ${DSS_DOCKER_ROOT_FOLDER}/installer/VERSION
}

get_version() {
	if [ -z ${BUILD_NUMBER} ]
	then
		echo "${RELEASE_NUMBER}-latest"
	else
		echo "${RELEASE_NUMBER}-${BUILD_NUMBER}"
	fi
}

zip_dp_binaries() {
  pushd build
	VERSION_STRING=$(get_version)
	tar -czf dss-docker-${VERSION_STRING}.tar.gz dss-docker
	popd
	pushd ${DSS_DOCKER_ROOT_FOLDER}
	tar -czf dss-installer-${VERSION_STRING}.tar.gz installer/*
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
build_dss
build_dss_app
build_dss_web
build_installer
zip_dp_binaries
log "All done"

