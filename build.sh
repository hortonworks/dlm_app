#!/usr/bin/env bash

echo "Current working directory is"
echo `pwd`

# 1. build webapp
pushd ./dpservice
sbt publishLocal
popd
pushd ./services/atlas/service
sbt publishLocal
popd
pushd ./webapp
sbt dist
popd

# 2. build ui
pushd ./ui
npm install
npm run build
popd

# 3. build a container bundling webapp and ui
docker-compose build

# 4
echo "All done"