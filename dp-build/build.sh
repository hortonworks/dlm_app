#!/usr/bin/env bash
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
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/dp-app/dlm-web
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
	if [ -d ../services/gateway/build ]; then
		rm -rf ../services/gateway/build
	fi
	mkdir ../services/gateway/build/
	pushd ../services/gateway
	gradle build
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
	cp -R ../dp-build/services ../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-app/
	cp ../dp-build/Dockerfile ../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-app/
	cp ../dp-build/nginx.ctmpl ../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-app/
	popd
}

build_dp_web() {
	log "Building dp-web"
	pushd ../dp-web
	if [ ${IS_JENKINS} == false ]; then
		npm install
		npm run build
	else
		echo "Not running dp-web NPM again"
	fi
	cp -R ./dist/* ../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-app/dp-web
	popd
}

build_dlm_web() {
	log "Building dlm-web"
	pushd ../dp-plugin-apps/dlm/dlm-web
	if [ ${IS_JENKINS} == false ]; then
		yarn
		npm run build
	else
		echo "Not running dlm-web build again"
	fi
	cp -R ./dist/* ../../../dp-build/${DP_DOCKER_ROOT_FOLDER}/dp-app/dlm-web
	popd
}

build_dp_knox() {
	log "Building dp-knox"
	cp -R knox-scripts ${DP_DOCKER_ROOT_FOLDER}/dp-knox/
	cp Dockerfile.knox ${DP_DOCKER_ROOT_FOLDER}/dp-knox/Dockerfile
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

build_installer() {
	log "Building installer"
	mkdir -p ${DP_DOCKER_ROOT_FOLDER}/installer/dbscripts/
	cp -R install/* ${DP_DOCKER_ROOT_FOLDER}/installer
	cp dp-docker-build.sh ${DP_DOCKER_ROOT_FOLDER}/installer/
	append_docker_image_version "hortonworks\/dp-db-service" ${DP_DOCKER_ROOT_FOLDER}/installer/docker-compose-apps.yml
	append_docker_image_version "hortonworks\/dp-cluster-service" ${DP_DOCKER_ROOT_FOLDER}/installer/docker-compose-apps.yml
	append_docker_image_version "hortonworks\/dp-gateway" ${DP_DOCKER_ROOT_FOLDER}/installer/docker-compose-apps.yml
	append_docker_image_version "hortonworks\/dp-app" ${DP_DOCKER_ROOT_FOLDER}/installer/docker-compose-apps.yml
	append_docker_image_version "hortonworks\/dp-knox" ${DP_DOCKER_ROOT_FOLDER}/installer/docker-compose-knox.yml
	cp -R ../services/db-service/db/* ${DP_DOCKER_ROOT_FOLDER}/installer/dbscripts/
	VERSION_STRING=$(get_version)
	echo ${VERSION_STRING} > ${DP_DOCKER_ROOT_FOLDER}/installer/VERSION	
}

append_docker_image_version() {
	IMAGE_NAME=$1
	DOCKER_COMPOSE_FILE_NAME=$2
	VERSION=$(get_version)
	sed -i".bak" -e "s/${IMAGE_NAME}/${IMAGE_NAME}:${VERSION}/g" ${DOCKER_COMPOSE_FILE_NAME}
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
build_dlm_web
build_dp_knox
build_cluster_service
build_installer
zip_dp_binaries
log "All done"
