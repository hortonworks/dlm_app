#!/usr/bin/env bash
set -e

log() {
	echo $@
}

clean_build() {
	rm -rf build
	mkdir build
}

unpack_for_docker_deploy() {
	log "Unzip to " $1
	log "Copy to " $2
	unzip `find ./target/universal -maxdepth 1 -type f -name *.zip|head -1` -d $1
	cp -R `ls -d $1/*/ | head -n 1` $2
}

build_dp() {
    log "Building dp"
	pushd ..
    sbt dist
    popd
}

build_db_service() {
	log "Building db-service"
	rm -rf ../services/db-service/build
	mkdir ../services/db-service/build
	pushd ../services/db-service
	unpack_for_docker_deploy build/tmp_dp-db-service build/dp-db-service
	popd
}

build_dp_app() {
	log "Building dp-app"
	pushd ../dp-app
	unpack_for_docker_deploy ../dp-build/build/tmp_dp-app ../dp-build/build/dp-app
	popd
}

build_dp_web() {
	log "Building dp-web"
	pushd ../dp-web
	npm install
	npm run build
	cp -R ./dist ../dp-build/build/dp-web
	popd
}

build_dlm_web() {
	log "Building dlm-web"
	pushd ../dlm-web
	yarn
	npm run build
	cp -R ./dist ../dp-build/build/dlm-web
	popd
}


build_cluster_service() {
	log "Building cluster-service"
	pushd ..
	sbt ";project clusterService ;assembly"
	popd
}

log "Current working directory is: " `pwd`
clean_build
build_dp
build_db_service
build_dp_app
build_dp_web
build_dlm_web
build_cluster_service
log "All done"