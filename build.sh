#!/usr/bin/env bash

echo "Current working directory is"
echo `pwd`

# 1. build dp-app
pushd ./dp-commons
sbt publishLocal
popd
pushd ./services/atlas/service
sbt publishLocal
popd
pushd ./dp-app
sbt dist
popd

# 2. build dp-web
pushd ./dp-web
npm install
npm run build
popd

# 3. build a container bundling dp-app and dp-web
docker-compose build

# 4
echo "All done"