Only docker-edge

### Install and Configure Docker Edge and Kubernetes
```
> brew install kubernetes
> brew cask install docker-edge
> kubectl config get-contexts
> kubectl config current-context
docker-for-desktop
> kubectl config use-context docker-for-desktop
```

### Get information about the running Kubernetes cluster
```
> kubectl get all --all-namespaces
> kubectl version
> kubectl cluster-info
Kubernetes master is running at https://localhost:6443
KubeDNS is running at https://localhost:6443/api/v1/namespaces/kube-system/services/kube-dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

### Get nodes part of the running Kubernetes cluster
```
> kubectl get nodes
NAME                 STATUS    ROLES     AGE       VERSION
docker-for-desktop   Ready     master    8d        v1.8.2
```

### Get information about system pods
```
> kubectl get pods --namespace=kube-system
NAME                                         READY     STATUS    RESTARTS   AGE
etcd-docker-for-desktop                      1/1       Running   0          8d
kube-apiserver-docker-for-desktop            1/1       Running   0          8d
kube-controller-manager-docker-for-desktop   1/1       Running   0          8d
kube-dns-545bc4bfd4-vdhtd                    3/3       Running   0          8d
kube-proxy-bhkct                             1/1       Running   0          8d
kube-scheduler-docker-for-desktop            1/1       Running   0          8d
kubernetes-dashboard-747d579ff5-grm4h        1/1       Running   0          12m
tiller-deploy-5b9d65c7f-9bgbk                1/1       Running   0          1h
```

### Update Docker registry secrets
```
> kubectl create -f ./dataplane/k8s-resources/dataplane-namespace.yaml
> kubectl create secret docker-registry docker-hub-private-registry-secret \
    --docker-server=docker.io \
    --docker-username="$DOCKER_USERNAME" \
    --docker-password="$DOCKER_PASSWORD" \
    --docker-email="$DOCKER_EMAIL" \
    --namespace=dataplane
> kubectl patch serviceaccount default \
    -p '{"imagePullSecrets": [{"name": "docker-hub-private-registry-secret"}]}' \
    --namespace=dataplane
serviceaccount "default" patched
```

### Install Certificates
```
> gpg --decrypt \
    -u "cloud-core" \
    -r "cloud-core" ./dataplane/config/dpstrialdev.io_cert/cert.yaml.gpg > ./dataplane/config/dpstrialdev.io_cert/cert.yaml
> helm upgrade \
    --install dpstrialdev.io ./dataplane/helm-charts/tls-cert \
    --values ./dataplane/config/dpstrialdev.io_cert/cert.yaml \
    --namespace=default \
    --set global.namespace=default
 
```

### Install and Use helm to deploy Dataplane
```
> brew install kubernetes-helm
> helm init
> helm install ./dataplane/helm-charts/dp-umbrella -n "$ORG" --set global.dpVersion=0.0.1-latest  --set global.adminPassword=admin
> helm delete --purge "$ORG"
```

### Install and proxy to Kubernetes dashboard
```
> kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml
secret “kubernetes-dashboard-certs” created
serviceaccount “kubernetes-dashboard” created
role “kubernetes-dashboard-minimal” created
rolebinding “kubernetes-dashboard-minimal” created
deployment “kubernetes-dashboard” created
service “kubernetes-dashboard” created
> kubectl proxy
Starting to serve on 127.0.0.1:8001
```
http://127.0.0.1:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/


### Get Shell
```
kubectl exec \
    --namespace=dataplane \
    -it "$POD_NAME" \
    -c "$CONTAINER_ID_OR_NAME" \
    -- /bin/sh
```

## Get Logs
```
kubectl logs \
    --namespace=dataplane "$POD_NAME" \
    -c "$CONTAINER_ID_OR_NAME"
```


Further Reading
https://kubernetes.io/docs/concepts/overview/components/
