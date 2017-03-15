#!/usr/bin/env bash

echo "Current working directory is"
echo `pwd`

# 0. Cleanup
rm -rf ./build
mkdir build

# 1. build dp-app
pushd ../dp-commons
sbt publishLocal
popd
pushd ../services/atlas/service
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

# 3. build a container bundling dp-app and dp-web
docker-compose build

# 4
echo "All done"