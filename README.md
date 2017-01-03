# Dataplane (Proof of concept)

# Standalone setup

## Requirements

* git
* JDK 8
* SBT. To get SBT on Linux, you can do
  * `curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo`
  * `sudo yum install sbt`
* Mongo 3.x. To get Mongo on Linux, you can follow the instructions here: https://docs.mongodb.com/v3.2/tutorial/install-mongodb-on-red-hat/

## Build and Setup

* `git clone https://github.com/hortonworks/dataplane`
* In folder webapp `sh ./build-deps.sh`
* Setup Mongo:
  * `use data_plane`
  * `db.createUser({user: "dp_admin", pwd: "dp_admin_password", roles: ["readWrite", "dbAdmin"]})`

## Run

* In folder webapp, `sbt run`
* Browse `http://host:9000/`
* Note: For every cluster you add to dataplane, you need to make sure Ambari and Atlas services are reachable by host names from the data plane control plane server.
* Note: `http_proxy` environment variable should not be set. If set, unset with `unset http_proxy` on the shell from where you are running `sbt run`

# Container setup

## Requirements

* System: CentOS 7 (for Docker support) or Mac OSX
* JDK 8
* SBT. To get SBT on Linux, you can do
  * `curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo`
  * `sudo yum install sbt`
* Docker. To get Docker on Linux, you can do
  * yum install docker
  * Edit /etc/sysconfig/docker. Remove --selinux-enabled from the OPTIONS config parameter. (Need to check how to avoid this)
  * systemctl start docker
* Docker-compose. To get Docker-compose on Linux, you can follow the instructions here: http://www.mattkimber.co.uk/setting-up-docker-and-docker-compose-on-aws/, except change the version to 1.7.1

## Build and Setup

* `git clone https://github.com/hortonworks/dataplane`
* In folder webapp, `sh ./build-deps.sh`
* In folder webapp, `sbt docker:publishLocal`

## Run

* In folder webapp, `docker-compose up`
* Verify 2 docker containers are running, something like
```
CONTAINER ID        IMAGE                  COMMAND                  CREATED             STATUS              PORTS                    NAMES
2a15671be76c        data_plane:0.1-alpha   "bin/data_plane -Dcon"   About an hour ago   Up 4 minutes        0.0.0.0:8080->9000/tcp   webapp_web_1
acb24854b46a        mongo                  "/entrypoint.sh mongo"   About an hour ago   Up 4 minutes        27017/tcp                webapp_dp_db_1
```
* Browse `http://host:8080/`
* Note: For every cluster you add to dataplane, you need to make sure Ambari and Atlas services are reachable by host names from the data plane control plane container (called `webapp_web_1`). Also, unfortunately, for now, you need to re-add these everytime you bring down and bring up the containers.
  * Typically I do the above, by running the bash shell on the webapp container like this:
`docker exec -u 0 -it 2a15671be76c bash`
  * Then add the lines to the /etc/hosts file: `echo "172.22.85.12    hyamijala-dp-fenton-dev-1.openstacklocal    hyamijala-dp-fenton-dev-1" >> /etc/hosts`
