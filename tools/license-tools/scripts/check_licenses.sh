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

LICENSE_CHECK_SCRIPT_DIR=`dirname ${BASH_SOURCE[0]}`
PROJECT_HOME=${LICENSE_CHECK_SCRIPT_DIR}/../../../

log() {
    echo "$@"
}

generate_scala_licenses() {
    log "Generating licenses from scala sources"
    pushd ${PROJECT_HOME}
    sbt dumpLicenseReport
    log "Licenses generated from scala sources"
    popd
}

collect_scala_licenses() {
    pushd ${PROJECT_HOME}
    local LICENSES_DIR=dp-build/build/licenses
    # Name the file with .txt so that it doesn't recursively find itself causing an infinite loop.
    local LICENSES_FILE=${LICENSES_DIR}/scala_licenses.txt
    mkdir -p ${LICENSES_DIR}
    rm -rf ${LICENSES_FILE}
    log "Collecting all scala licenses to ${LICENSES_FILE}"
    find . -iname *licenses.csv | xargs cat >> ${LICENSES_FILE}
    log "All scala licenses available at ${LICENSES_FILE}"
    popd
}

generate_npm_licenses() {
    pushd ${PROJECT_HOME}
    cd dp-web
    local NPM_LICENSES_FILE_PATH=../dp-build/build/licenses/npm_licenses.txt
    log "Generating licenses from npm sources"
    license-checker --csv --out ${NPM_LICENSES_FILE_PATH}
    log "Licenses generated from npm sources"
    popd
}

run_scala_license_checks() {
    pushd ${PROJECT_HOME}
    cd tools/license-tools
    sbt package
    sbt "run check_licenses \
            ../../dp-build/build/licenses/scala_licenses.txt \
            src/main/resources/approved_licenses.txt \
            src/main/resources/prohibited_licenses.txt \
            src/main/resources/license_mapping.txt"
    popd
}

generate_scala_licenses
collect_scala_licenses
generate_npm_licenses
run_scala_license_checks
