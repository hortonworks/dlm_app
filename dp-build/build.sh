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

DP_DOCKER_ROOT_FOLDER=build/dp-docker
RELEASE_NUMBER=0.0.1
IS_JENKINS=false

log() {
	echo $@
}

clean_build() {
	rm -rf build
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-db-service
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-app/dp-web
    mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-knox-agent
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-knox
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-cluster-service
 	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-gateway
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/installer
}

unpack_for_docker_deploy() {
	log "Unzip to " $1
	log "Copy to " $2
	unzip `find ./target/universal -maxdepth 1 -type f -name *.zip|head -1` -d $1
	cp -R `ls -d $1/*/ | head -n 1` $2
}

build_dp() {
    if [ ${IS_JENKINS} == false ]; then
        log "Building dp"
        pushd ..
        sbt dist
        popd
    else
        echo "Not building DP again in Jenkins"
    fi

}

build_db_service() {
	log "Building db-service"
	rm -rf ../services/db-service/build
	mkdir ../services/db-service/build
	pushd ../services/db-service
	unpack_for_docker_deploy build/tmp_dp-db-service ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-db-service/dp-db-service
	cp Dockerfile ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-db-service/
	cp docker_service_start.sh ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-db-service/docker_service_start.sh
	popd
}

build_dp_gateway() {
	log "Building gateway"
	pushd ../services/gateway
    if [ ${IS_JENKINS} == false ]; then
        log "Running gradle build"
	    gradle clean build
    else
        log "Not building DP Gateway again in Jenkins"
    fi 
	log "Copying gateway build artifacts"
	mkdir -p ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-gateway/build/ 
	cp -rf build/**  ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-gateway/build/ 
	cp Dockerfile ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-gateway/
	cp docker_service_start.sh ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-gateway/docker_service_start.sh
	popd
}

build_dp_app() {
	log "Building dp-app"
	pushd ../dp-app
	unpack_for_docker_deploy ../dp-build/build/tmp_dp-app ../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-app/dp-app
	cp -R ../dp-build/docker/app/* ../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-app/
	popd
}

build_dp_web() {
	log "Building dp-web"
	pushd ../dp-web
	if [ ${IS_JENKINS} == false ]; then
		yarn install
		yarn run build
	else
		echo "Not running dp-web NPM again"
	fi
	cp -R ./dist/* ../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-app/dp-web
	popd
}
build_knox_agent() {
     log "Building Knox Agent"
     rm -rf ../services/knox-agent/build
     mkdir ../services/knox-agent/build
     pushd ../services/knox-agent
     unpack_for_docker_deploy build/tmp_dp-knox-agent ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-knox-agent/dp-knox-agent
     popd
}

build_dp_knox() {
	log "Building dp-knox"
	# move docker files and utils
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-knox/
	cp -R ./docker/knox/* ${DP_DOCKER_ROOT_FOLDER}/dp-knox/
    cp -R build/dp-docker/dp-knox-agent/dp-knox-agent/ ${DP_DOCKER_ROOT_FOLDER}/dp-knox/dp-knox-agent
}

build_cluster_service() {
	log "Building cluster service"
	rm -rf ../services/cluster-service/build
        mkdir ../services/cluster-service/build
	pushd ../services/cluster-service
	unpack_for_docker_deploy build/tmp_dp-cluster-service ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-cluster-service/dp-cluster-service
	cp Dockerfile ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-cluster-service
        cp docker_service_start.sh ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-cluster-service
	popd
}

build_migrate() {
	log "Building dp-migrate"

	# move docker files and utils
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-migrate/
	cp -R ./docker/migrate/* ${DP_DOCKER_ROOT_FOLDER}/dp-migrate/
	
	# move flyway migration scripts
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-migrate/dbscripts/
	cp -R ../services/db-service/db/* ${DP_DOCKER_ROOT_FOLDER}/dp-migrate/dbscripts/
	
	# removed unneccesary files
	rm -rf ${DP_DOCKER_ROOT_FOLDER}/dp-migrate/dbscripts/generators
	rm ${DP_DOCKER_ROOT_FOLDER}/dp-migrate/dbscripts/flyway.conf
	rm ${DP_DOCKER_ROOT_FOLDER}/dp-migrate/dbscripts/erd.png

	# move bcrypt tool
	log "Moving bcrypter"
	rm -rf ../tools/bcrypter/build
	mkdir ../tools/bcrypter/build
	pushd ../tools/bcrypter
	unpack_for_docker_deploy build/tmp_tools_bcrypter ../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-migrate/bcrypter
	popd
}

replace_ga_tracking_id() {
    log "Replacing GA tracking id"

    if [ -z ${GA_TRACKING_ID} ]; then
        log "GA_TRACKING_ID environment variable not found. Not replacing anything"
    else
        MIGRATE_DOCKER_FILE=${DP_DOCKER_ROOT_FOLDER}/dp-migrate/Dockerfile
        sed -i.bak -e \
            "s/GA_TRACKING_ID_VALUE_TO_REPLACE/${GA_TRACKING_ID}/g" ${MIGRATE_DOCKER_FILE}
        if ! diff ${MIGRATE_DOCKER_FILE} ${MIGRATE_DOCKER_FILE}.bak &> /dev/null; then
            echo "Replaced GA tracking id"
        else
            echo "Replacing GA tracking id failed"
        fi
        rm ${MIGRATE_DOCKER_FILE}.bak
    fi
}

build_legalese() {
	log "Collecting legalese"
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/legalese
	cp ../COPYRIGHT ${DP_DOCKER_ROOT_FOLDER}/legalese/
	cp ../third_party_components.txt ${DP_DOCKER_ROOT_FOLDER}/legalese/
	cp ../third_party_operating_system_components.txt ${DP_DOCKER_ROOT_FOLDER}/legalese/
}

build_installer() {
	log "Building installer"
    mkdir -p ${DP_DOCKER_ROOT_FOLDER}/installer/certs/
	cp -R install/* ${DP_DOCKER_ROOT_FOLDER}/installer
	cp -R ${DP_DOCKER_ROOT_FOLDER}/legalese ${DP_DOCKER_ROOT_FOLDER}/installer/
	cp dp-docker-build.sh ${DP_DOCKER_ROOT_FOLDER}/installer/
	cp dp-docker-build.sh ${DP_DOCKER_ROOT_FOLDER}/installer/
	VERSION_STRING=$(get_version)
	echo ${VERSION_STRING} > ${DP_DOCKER_ROOT_FOLDER}/installer/VERSION	
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
	tar -czf dp-docker-${VERSION_STRING}.tar.gz dp-docker
	popd
	pushd ${DP_DOCKER_ROOT_FOLDER}
	tar -czf dp-installer-${VERSION_STRING}.tar.gz installer/*
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
build_dp
build_dp_gateway
build_db_service
build_dp_app
build_dp_web
build_knox_agent
build_dp_knox
build_cluster_service
build_migrate
replace_ga_tracking_id
build_legalese
build_installer
zip_dp_binaries
log "All done"

