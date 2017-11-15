# Dataplane K8S Setup

Ensure that following variables are set correctly:
```
DOCKER_USERNAME
DOCKER_PASSWORD
DOCKER_EMAIL
ORG="acme"
```
-------------------------------------------------

## Pre-requisites
You need the following dependencies installed for a local setup.
```
brew cask install docker
brew install kubectl
brew cask install minikube
brew install docker-machine-driver-xhyve
minikube start
eval $(minikube docker-env)
minikube addons enable ingress
```
## Get K8S Dashboard
```
minikube dashboard
```

## Create Namespace
```
kubectl create -f ./dataplane/k8s-resources/dataplane-namespace.yaml
```
OR
```
helm install ./dataplane/k8s-resources/dataplane-namespace.yaml -n "$RELEASE_NAME"
```

## Configure Docker-Hub

### Create Secret
```
kubectl create secret docker-registry docker-hub-private-registry-secret \
    --docker-server=docker.io --docker-username="$DOCKER_USERNAME" \
    --docker-password="$DOCKER_PASSWORD" --docker-email="$DOCKER_EMAIL" \
    --namespace=dataplane
```

### Patch Service Account
```
kubectl patch serviceaccount default \
    -p '{"imagePullSecrets": [{"name": "docker-hub-private-registry-secret"}]}' \
    --namespace=dataplane
```

## Create Secrets
### Database
```
POSTGRES_USER="dp-admin"
POSTGRES_PASSWORD=`openssl rand -base64 32`
kubectl create secret generic "dp-database-secret-$ORG" \
    --from-literal="POSTGRES_USER=$POSTGRES_USER" \
    --from-literal="POSTGRES_PASSWORD=$POSTGRES_PASSWORD" \
    --namespace=dataplane
```

### Knox
```
KNOX_MASTER_PASSWORD=`openssl rand -base64 32`
CERTIFICATE_PASSWORD=`openssl rand -base64 32`
kubectl create secret generic "dp-knox-secret-$ORG" \
    --from-literal="KNOX_MASTER_PASSWORD=$KNOX_MASTER_PASSWORD" \
    --from-literal="CERTIFICATE_PASSWORD=$CERTIFICATE_PASSWORD" \
    --namespace=dataplane
```

## Install

In the following command, you can replace `latest` with the release of Dataplane you wish to use, eg. 1.1.0.0-12
```
helm install ./dataplane/helm-charts/dp-umbrella -n "$ORG" --set global.dpVersion=latest
```

If you want to change the domain name, use the following command:
```
helm install ./dataplane/helm-charts/dp-umbrella -n "$ORG" --set global.dpVersion=latest,ingress.domain=tmpdpstrialdev.io
```

## Upgrade
```
helm upgrade $RELEASE_NAME ./dataplane/k8s-resources/dataplane-namespace.yaml
```

## Rollback
```
helm rollback RELEASE_NAME REVISION_NUMBER
```

## Delete

```
helm delete --purge $RELEASE_NAME
```

## Debugging

### Dry Run of Charts
```
helm install --debug --dry-run ./dataplane/helm-charts/dp-umbrella -n "$ORG"
```

### Get Shell
```
kubectl exec \
    --namespace=dataplane \
    -it `kubectl get pods --namespace=dataplane -l "app=dp-core, release=$ORG" -o name | cut -d "/" -f 2` \
    -c "$CONTAINER_ID_OR_NAME" \
    -- /bin/sh
```

## Get Logs
```
kubectl logs \
    --namespace=dataplane `kubectl get pods --namespace=dataplane -l "app=dp-core, release=$ORG" -o name | cut -d "/" -f 2` \
    -c "$CONTAINER_ID_OR_NAME"
```

## Known Issues

Sometimes, pod containers randomly stop and are restarted by Kubernetes. It might be because of insufficient memory on the VM but this has not been investigted yet.