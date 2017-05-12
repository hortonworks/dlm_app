# Dataplane

# Standalone setup

## Requirements

* git
* JDK 8
* SBT 0.13.1 or above. To get SBT on Linux, you can do
  * `curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo`
  * `sudo yum install sbt`
* Nodejs 6.10.0 or above. To get Nodejs on Linux, you can follow instructions here: https://nodejs.org/en/download/package-manager/#enterprise-linux-and-fedora
* [Yarn](https://yarnpkg.com) package manager (`npm install --global yarn`)
* docker-machine (tested with 0.7.0), docker (tested with 1.8.0), docker-compose (tested with 1.7.1)

## Build

* `git clone https://github.com/hortonworks/dataplane`
* In folder dp-build `sh ./build.sh`. First time build could take sometime as all Scala dependencies are downloaded and cached.
* In folder dp-build/build, an install tarball is created called `dp-installer.tar.gz`. This can be used to deploy Dataplane components on any machine with docker support.


## Setup (from source)

* Ensure the steps in Build section above are followed.
* We can use docker to bring up the application without requiring to install other runtime dependencies like Postgres, NGinx etc. Follow these steps to bring up the docker containers.
* A utility script has been provided in the `dp-build/build/installer` folder called `dpdeploy.sh` to help with this. This wraps around docker-compose commands and aims to provide a simpler interface.
* There is a certain sequence to follow to bring up the application, as detailed below. All commands need to be executed from the dp-build folder.
* For a fresh setup:
  * Initialize the Postgres database: `./dpdeploy.sh init db`
  * Then, run the DB migrations: `./dpdeploy.sh migrate`. This sets up the database schema using the Flyway migration tool (https://flywaydb.org/)
  * The migrate command takes a while to complete. After it is done, you can kill the containers with a Ctrl+c
  * You can verify the status of migrations by executing the following steps:
    * `docker exec -it dpbuild_dp-database_1 psql -U dp_admin -W -h dp-database dataplane`
    * Enter `dp_admin` as the password
    * `select * from schema_version;` This should show some migrations.
  * Build the containers for the application: `./dp-docker-build.sh build`
  * Initialize the application: `./dpdeploy.sh init app`
* For an existing setup:
  * Stop the application: `./dpdeploy.sh stop`
  * Start the application: `./dpdeploy.sh start`
* Anytime, you can check the status of the containers with: `./dpdeploy.sh ps`
* To completely destroy and start over do: `./dpdeploy.sh destroy`
* Knox integration:
  * In addition to local users, you can also authenticate via Knox-SSO.
  * To do this:
     * `./dp-docker-build.sh build knox`: This builds the Knox container based on HDP 2.6 repo images.
     * `./dpdeploy.sh init knox`: This initializes the Knox container, by setting up necessary configuration, including things like the Knox master password, which are taken from the end user.
     * Ignore any warnings you get at this moment: these will be fixed in coming builds.
     * *Note*: If the app was started before Knox, you would need to restart the app with `./dpdeploy.sh stop` and `./dpdeploy.sh start`.
     * Add an entry to your `/etc/hosts` file as follows: `<ip> dataplane`, where <ip> is the IP Address of the docker VM. For e.g. if you are using docker-machine, this can be obtained using `docker-machine env`
     * From your browser, hit `http://dataplane/sign-in`. This will bring up the login screen with an option to login via Knox-SSO.
     * Click the Knox-SSO link. You should be redirected to the KnoxSSO login page.
     * Enter `admin` and `admin-password` as username and password respectively.
     * You will be logged in and can proceed with rest of the functionality.
     * To stop/start/destroy Knox, you can do `./dpdeploy.sh [stop|start|destroy] knox`
  
