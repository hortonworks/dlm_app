#!/usr/bin/env bash

echo "Current working directory is"
echo `pwd`

# 0. Cleanup
rm -rf ../services/db-service/build
mkdir ../services/db-service/build
rm -rf build
mkdir build

# 1. build dp-app
pushd ..
sbt dist
popd

pushd ../services/db-service
unzip `find ./target/universal -maxdepth 1 -type f -name *.zip|head -1` -d build/tmp_dp-db-service
cp -R `ls -d build/tmp_dp-db-service/*/|head -n 1` build/dp-db-service
popd

pushd ../dp-app
unzip `find ./target/universal -maxdepth 1 -type f -name *.zip|head -1` -d ../dp-build/build/tmp_dp-app
cp -R `ls -d ../dp-build/build/tmp_dp-app/*/|head -n 1` ../dp-build/build/dp-app
popd

# 2. build dp-web
pushd ../dp-web
npm install
npm run build
cp -R ./dist ../dp-build/build/dp-web
popd

# 3. build dlm-web
pushd ../dlm-web
yarn
npm run build
cp -R ./dist ../dp-build/build/dlm-web
popd

# 4. build cluster services
pushd ..
sbt ";project clusterService ;assembly"
popd

# 5
echo "All done"
