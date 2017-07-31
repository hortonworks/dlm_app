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
* Centos 7 or Mac OSX are tested platforms

## Build

* `git clone https://github.com/hortonworks/dataplane`
* In folder dp-build `sh ./build.sh`. First time build could take sometime as all Scala dependencies are downloaded and cached.
* In folder dp-build/build/dp-docker, an install tarball is created called `dp-installer.tar.gz`. This can be used to deploy Dataplane components on any machine with docker support.

## Package

If your goal is to build and package the core dataplane project for distribution, trigger `./dp-docker-build.sh package` without any additional arguments. This would generate a tar with name `dp-core` labelled with correct version.
This tarball includes deployment scripts and relevant docker images.


## Setup (from source)

* Ensure the steps in Build section above are followed.
* We can use docker to bring up the application without requiring to install other runtime dependencies like Postgres, NGinx etc. Follow these steps to bring up the docker containers.
* A utility script has been provided in the `dp-build/build/dp-docker/installer` folder called `dpdeploy.sh` to help with this. This wraps around docker-compose commands and aims to provide a simpler interface.
* There is a certain sequence to follow to bring up the application, as detailed below. All commands need to be executed from the dp-build folder.
* For a fresh setup:
  * Initialize the Postgres database: `./dpdeploy.sh init db`
  * Then, run the DB migrations: `./dpdeploy.sh migrate`. This sets up the database schema using the Flyway migration tool (https://flywaydb.org/)
  * You can verify the status of migrations by executing the following steps:
    * `docker exec -it dpbuild_dp-database_1 psql -U dp_admin -W -h dp-database dataplane`
    * Enter `dp_admin` as the password
    * `select * from schema_version;` This should show some migrations.
  * Build the containers for the application: `./dp-docker-build.sh build`
  * Initialize the application: `./dpdeploy.sh init app`. This will prompt you to enter an IP Address. Please enter the routable IP of the host where the docker containers are running. In future iterations, we will work to auto-detect this.
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

## Setup (from binaries)

Dataplane docker images are published to docker-hub as a private repository in the `hortonworks` organization. If you need access to these images, please contact the Dataplane team for providing access with your docker-hub ID.

In order to make it easy to work with these images, an installation tarball containing the `dpdeploy.sh` build script and other runtime files is published as a CI artifact. Each push of the docker images results in a new installation tarball to be created.

The images are tagged with a {product-version}-{build-number} tag, for e.g 0.0.1-184. This is also the version of the installation tarball, and can be queried using the command `./dpdeploy.sh version`.

So, to get a version of dataplane on a docker supported machine, do the following:

* Download the last successful artifact of the installation tarball named `dp-installer-VERSION-BUILD.tar.gz` from [this location](http://172.22.85.155:8080/job/dp-docker-build/) 
  * *Hint*: You can automatically fetch this from a script using the following URL: `wget http://172.22.85.155:8080/job/dp-docker-build/lastSuccessfulBuild/artifact/archive/dp-build/build/dp-docker/*zip*/dp-docker.zip` and extract the contents of the zip, which will contain the installation tarball within it.
* Untar it.
* `cd installer`
* Execute the usual `dpdeploy.sh` commands described above. These will pull the correspondingly tagged images from docker-hub. The first pull from the docker-hub repo might take a while, but once the layers are cached, it should be faster.

## Using external database
Only Postgresql is supported. To prepare the database, following steps need to be followed:
1. Install `postgresql-server` via yum. `sudo yum install postgresql-server`.
2. Enable remote access:
  * Edit `postgresql.conf` to have `listen_addresses = '*'`.
  * Edit `pg_hba.conf` to have `host    all             all             0.0.0.0/0            md5`. IP ranges can be modified as required if known.
3. Restart `postgresql` with `service postgresql restart`.
4. Create a database with `createdb <database_name>`. You might need to impersonate the default user `postgres`.
5. LogIn to `postgresql` with `psql -h <database_ip> <database_name>`.
6. Add user with `CREATE USER <user_name> WITH PASSWORD '<passowrd>';`.
7. Give neccessary permissions of created database to desired user. Recommended: `ALTER DATABASE <database_name> OWNER TO <user_name>;`
8. Provide connection information in `${INSTALLER_HOME}/config.env.sh`.
```
USE_EXT_DB="yes"
DATABASE_URI="jdbc:postgresql://<host_name>:5432/<database_name>"
DATABASE_USER="<user_name>"
DATABASE_PASS="<password>"
```
9. Deploy dataplane as usual using `./dpdeploy.sh`

## Known Issues

* When trying with Centos 7, SE Linux needs to be disabled for now. This is a workaround to a bug that causes external volume mounts to fail. We will try and resolve this issue going forward.
  * The precise steps to disable are to run this command as root: `su -c "setenforce 0"`. The issue are workaround are documented [here](http://stackoverflow.com/questions/24288616/permission-denied-on-accessing-host-directory-in-docker)
