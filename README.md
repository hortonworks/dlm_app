# Dataplane (Proof of concept)

## Requirements

* git
* JDK 8
* SBT. To get SBT on Linux, you can do
  * `curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo`
  * `sudo yum install sbt`
* Mongo 3.x. To get Mongo on Linux, you can follow the instructions here: https://docs.mongodb.com/v3.2/tutorial/install-mongodb-on-red-hat/

## Build and Setup

* `git clone https://github.com/hortonworks/dataplane`
* In folder dpservice `sbt publishLocal` (Not sure if this is required)
* In folder webapp `sh ./build-deps.sh`
* Setup Mongo:
  * `use data_plane`
  * `db.createUser({user: "dp_admin", pwd: "dp_admin_password", roles: ["readWrite", "dbAdmin"]})

## Run

* In folder webapp, `sbt run`
* Browse `http://<host>:9000/