#!/usr/bin/env bash

echo "Current working directory is"
echo `pwd`

# 0. Cleanup
rm -rf ../services/db-service/build
mkdir ../services/db-service/build
rm -rf build
mkdir build

# 1. build dp-app
pushd ../dp-commons
sbt publishLocal
popd
pushd ../services/atlas/service
sbt publishLocal
popd
pushd ../services/db-service
sbt dist
unzip `find ./target/universal -maxdepth 1 -type f -name *.zip|head -1` -d build/tmp_dp-db-service
cp -R `ls -d build/tmp_dp-db-service/*/|head -n 1` build/dp-db-service
popd
pushd ../clients/db-client
sbt publishLocal
popd
pushd ../dp-app
sbt dist
unzip `find ./target/universal -maxdepth 1 -type f -name *.zip|head -1` -d ../dp-build/build/tmp_dp-app
cp -R `ls -d ../dp-build/build/tmp_dp-app/*/|head -n 1` ../dp-build/build/dp-app
popd

# 2. build dp-web
pushd ../dp-web
npm install
npm run build
cp -R ./dist ../dp-build/build/dp-web
popd

# 3. build cluster services
pushd ../services/rest-mock
sbt publishLocal
popd
pushd ../services/cluster-service
sbt assembly
popd

# 4
echo "All done"
