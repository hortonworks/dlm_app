# Dataplane

# Standalone setup

## Requirements

* git
* JDK 8
* SBT 0.13.1 or above. To get SBT on Linux, you can do
  * `curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo`
  * `sudo yum install sbt`
* Nodejs 6.10.0 or above. To get Nodejs on Linux, you can follow instructions here: https://nodejs.org/en/download/package-manager/#enterprise-linux-and-fedora
* docker-machine (tested with 0.7.0), docker (tested with 1.8.0), docker-compose (tested with 1.7.1)

## Build

* `git clone https://github.com/hortonworks/dataplane`
* In folder dp-build `sh ./build.sh`. First time build could take sometime as all Scala dependencies are downloaded and cached.

## Setup

* We can use docker to bring up the application without requiring to install other runtime dependencies like Postgres, NGinx etc. Follow these steps to bring up the docker containers.
* A utility script has been provided in the dp-build folder called `dpdeploy.sh` to help with this. This wraps around docker-compose commands and aims to provide a simpler interface.
* There is a certain sequence to follow to bring up the application, as detailed below. All commands need to be executed from the dp-build folder.
* For a fresh setup:
  * Initialize the Postgres database: `./dpdeploy.sh init db`
  * Then, run the DB migrations: `./dpdeploy.sh migrate`. This sets up the database schema using the Flyway migration tool (https://flywaydb.org/)
  * The migrate command takes a while to complete. After it is done, you can kill the containers with a Ctrl+c
  * You can verify the status of migrations by executing the following steps:
    * `docker exec -it dpbuild_dp-database_1 psql -U dp_admin -W -h dp-database dataplane`
    * Enter `dp_admin` as the password
    * `select * from schema_version;` This should show some migrations.
  * Build the containers for the application: `./dpdeploy.sh build`
  * Initialize the application: `./dpdeploy.sh init app`
* For an existing setup:
  * Stop the application: `./dpdeploy.sh stop`
  * Start the application: `./dpdeploy.sh start`
* Anytime, you can check the status of the containers with: `./dpdeploy.sh ps`
* To completely destroy and start over do: `./dpdeploy.sh destroy`
