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
	pushd ../dp-plugin-apps/dlm/dlm-web
	yarn
	npm run build
	cp -R ./dist ../../../dp-build/build/dlm-web
	popd
}


build_cluster_service() {
	log "Building cluster service"
	rm -rf ../services/cluster-service/build
	mkdir ../services/cluster-service/build
	pushd ../services/cluster-service
	unpack_for_docker_deploy build/tmp_dp-cluster-service build/dp-cluster-service
	popd
}

build_installer() {
	log "Building installer"
	mkdir -p build/installer/dbscripts/
	cp -R install/* build/installer/
	cp -R ../services/db-service/db/* build/installer/dbscripts/
	pushd build
	tar -czf dp-installer.tar.gz installer/*
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
build_installer
log "All done"