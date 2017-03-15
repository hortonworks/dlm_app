#!/usr/bin/env bash

echo "Building project dependencies"

echo "Current working directory is"
echo `pwd`

pushd ../dp-commons
sbt publishLocal
popd
pushd ../services/atlas/service
sbt publishLocal
popd
cd ../dp-app

echo "All done"


