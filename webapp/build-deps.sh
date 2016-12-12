#!/usr/bin/env bash

echo "Building project dependencies"

echo "Current working directory is"
echo `pwd`

pushd ../dpservice
sbt publishLocal
popd
pushd ../services/atlas/service
sbt publishLocal
popd
cd ../webapp

echo "All done"


