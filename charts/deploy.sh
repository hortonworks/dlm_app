#!/bin/bash
kubectl create namespace zabhi-dev

helm install dps-core \
    --set registry.url=docker.io \
    --set registry.username=zabhi \
    --set registry.password=HWdocker@6491 \
    --namespace=zabhi-dev
