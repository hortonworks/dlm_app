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
* `sbt universal:packageZipTarball` - This will generate a tarball in the folder `target/universal/data_plane-0.1-alpha.tgz`
* Setup Mongo:
  * `use data_plane`
  * `db.createUser({user: "dp_admin", pwd: "dp_admin_password", roles: ["readWrite", "dbAdmin"]})`

## Run

* Untar the tarball generated above into some directory
* `cd bin`
* `./dataplane`
* Browse `http://host:9000/`
* Note: For every cluster you add to dataplane, you need to make sure Ambari and Atlas services are reachable by host names from the data plane control plane server.
* Note: `http_proxy` environment variable should not be set. If set, unset with `unset http_proxy` on the shell from where you are running `sbt run`

# Docker Image Build

## Requirements

* System: Any
* JDK 8
* SBT >= 0.13.13. To get SBT on Linux, you can do
  * `curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo`
  * `sudo yum install sbt`
* NodeJS >= 7.0.0
* `docker` & `docker-compose`
  * The easiest way to setup docker and docker-compose on Windows / Mac is to install docker-toolbox, which is available at https://www.docker.com/products/docker-toolbox.
  * On GNU / Linux, you can use corresponding package managers to get and install them. Instruction for `yum` and `systemd` based distributions are as follows:
    * `yum install docker`
    * `systemctl start docker`
  * Docker-compose. To get Docker-compose on Linux, you can follow the instructions here: https://gist.github.com/daspecster/f612a10f2efa3c53eee3a0cd275df5b6

## Build and Setup

* `git clone https://github.com/hortonworks/dataplane`
* In root, execute `sh build.sh`

## Run

* In folder root, `docker-compose up`
* Verify 2 docker containers are running, something like
```
CONTAINER ID        IMAGE                  COMMAND                  CREATED             STATUS              PORTS                    NAMES
2a15671be76c        hortonworks/data-plane "runsvdir /etc/sv"       About an hour ago   Up 4 minutes        0.0.0.0:80->80/tcp       webapp_web_1
acb24854b46a        mongo                  "/entrypoint.sh mongo"   About an hour ago   Up 4 minutes        27017/tcp                webapp_dp_db_1
```
* Browse `http://host:80/`
* Note: For every cluster you add to dataplane, you need to make sure Ambari and Atlas services are reachable by host names from the data plane control plane container (called `webapp_web_1`). Also, unfortunately, for now, you need to re-add these everytime you bring down and bring up the containers.
  * Typically I do the above, by running the bash shell on the webapp container like this:
`docker exec -u 0 -it 2a15671be76c bash`
  * Then add the lines to the /etc/hosts file: `echo "172.22.85.12    hyamijala-dp-fenton-dev-1.openstacklocal    hyamijala-dp-fenton-dev-1" >> /etc/hosts`

## BDR

* Ambari cluster running BDR needs to be started with 'views.http.x-frame-options' in ambari.properties set to 'ALLOWALL'.
* Presently it is hard coded to @Peeyush's server which is at http://172.22.120.184:8080/views/BEACON/1.0.0/BEACON/.
* To ensure that the user is logged in, before demo, users need to login at http://172.22.120.184:8080 using credentials admin:admin.
