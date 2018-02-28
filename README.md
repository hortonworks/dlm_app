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
* docker-machine (tested with 0.7.0), docker (tested with 1.12.0)
* Centos 7 or Mac OSX are tested platforms

## Build

* `git clone https://github.com/hortonworks/dataplane`
* In folder dp-build `./build.sh`. First time build could take sometime as all Scala dependencies are downloaded and cached.
* In the same folder, trigger `./dp-docker-build.sh build` and `./dp-docker-build.sh build knox` to build required docker images.
* In folder dp-build/build/dp-docker, an install tarball is created called `dp-installer.tar.gz`. This can be used to deploy Dataplane components on any machine with docker support.

## Package

If your goal is to build and package the core dataplane project for distribution, trigger `./dp-docker-build.sh package` without any additional arguments. This would generate a tar with name `dp-core` labelled with correct version.
This tarball includes deployment scripts and relevant docker images.

## Generating license reports
* For `sbt` projects, we have added `sbt-license-report` plugin for both core and dlm. It can be triggered from sbt console by using: `dumpLicenseReport ` from relevant module. The report can be found at `target/license-reports` in the individual project's working directory.
* For `nodejs`/`yarn` projects, we have added `nlf` as a dev dependency. It can be triggered using `yarn run report:licenses`. The report is displayed on console.
* We have added `gradle-license-report` for gateway. It can be triggered using `gradle generateLicenseReport`. The report can be found at `build/reports/dependency-license` in the project's working directory.


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

## Setup (from Hortonworks Release Engineering portal)

### Using tarballs

Dataplane can now be installed using tarballs that are produced by Hortonworks Release Engineering team. These tarballs contain:
* Docker images from which containers required for Dataplane services will be created and launched.
* Installation scripts that help the user to install and start Dataplane.

Follow these instructions for working with these tarballs.

* Navigate to [Hortonworks Release Engineering Portal](http://release.eng.hortonworks.com/portal/)
* Select the product 'DP'.
* Select the release use wish to use,for e.g. 'DP-1.0.0.0'. This should lead you to a release specific build page like [this](http://release.eng.hortonworks.com/portal/release/DP/releasedVersion/DP-1.0.0.0/1.0.0.0/)
* Identify the build you wish to use, and select the Repo details icon (the eye shaped icon).
* From the popup that launches, select the 'baseurl' field which will be of the form 'http://s3.amazonaws.com/dev.hortonworks.com/DP/centos6/1.x/BUILDS/1.0.0.0-`buildnum`'
* For DP Core, construct the full URL of the build by appending 'tars/dp-docker/dp-1.0.0.0-`buildnum`.tar.gz' to the baseurl. Substitute `buildnum` with the value from the baseurl.
* For DLM Service, construct the full URL of the build by appending 'tars/dlm-docker/dlm-1.0.0.0-`buildnum`.tar.gz' to the baseurl. Substitute `buildnum` with the value from the baseurl.
* On the machine where you would like to install Dataplane, download the tarballs using wget or curl. 
   * E.g. for DP Core `wget http://dev.hortonworks.com.s3.amazonaws.com/DP/centos6/1.x/BUILDS/1.0.0.0-buildnum/tars/dp-docker/dp-1.0.0.0-buildnum.tar.gz`
   * E.g. for DLM Service `wget http://dev.hortonworks.com.s3.amazonaws.com/DP/centos6/1.x/BUILDS/1.0.0.0-buildnum/tars/dlm-docker/dlm-1.0.0.0-buildnum.tar.gz`
   * *Note:* These tarballs are fairly large in size. The DP Core tarball is around 1.1G and the DLM Service tarball is around 200M.
* Untar the tarballs. For e.g `tar -xzf dp-1.0.0.0-<buildnum>.tar.gz` and `tar -xzf dlm-1.0.0.0-<buildnum>.tar.gz`. Let us refer to the directory of install as DATAPLANE_HOME
* cd $DATAPLANE_HOME/dp-core/bin
* Edit the file `config.env.sh` to enable properties you want to configure. Please refer to the section 'Bootstrap Configuration' for more details.
* Run `./dpdeploy.sh load`. This will load all DP Core docker images which are bundled in the tarballs into the local machine's docker repo. Note that doing this for the first Dataplane installation might take a while. 
* Run `./dpdeploy.sh init --all`
* cd $DATAPLANE_HOME/dlm/bin
* Run `./dlmdeploy.sh load`. This will load the DLM Service docker image into the local machine's docker repo. Note that doing this for the first Dataplane installation might take a while.
* Run `./dlmdeploy.sh init`
* Verify the services are up using `docker ps`. There must be 8 service containers that are running.
  
### Using RPMs

Dataplane can now be installed using RPMs that are produced by Hortonworks Release Engineering team. These RPMs lay down the following bits on the host machine:
* Docker images from which containers required for Dataplane services will be created and launched.
* Installation scripts that help the user to install and start Dataplane.

Follow these instructions for working with these RPMs.

* Navigate to [Hortonworks Release Engineering Portal](http://release.eng.hortonworks.com/portal/)
* Select the product 'DP'.
* Select the release use wish to use,for e.g. 'DP-1.0.0.0'. This should lead you to a release specific build page like [this](http://release.eng.hortonworks.com/portal/release/DP/releasedVersion/DP-1.0.0.0/1.0.0.0/)
* Identify the build you wish to use, and select the Repo details icon (the eye shaped icon).
* From the popup that launches, select the 'baseurl' field which will be of the form 'http://s3.amazonaws.com/dev.hortonworks.com/DP/centos6/1.x/BUILDS/1.0.0.0-`buildnum`'
* On the machine where you would like to install Dataplane, download the repo file using wget as follows:
   * E.g. for DP Core `wget -nv http://s3.amazonaws.com/dev.hortonworks.com/DP/centos6/1.x/BUILDS/1.0.0.0-buildnum/dpbn.repo -O /etc/yum.repos.d/dp.repo`
* Execute the following commands to install the RPMs:
   * E.g. for DP Core `yum install dp-core`
   * E.g. for DLM Service `yum install dlm-app`
* cd /usr/dp/`buildnum`/core/bin 
* Edit the file `config.env.sh` to enable properties you want to configure. Please refer to the section 'Bootstrap Configuration' for more details.
* Run `./dpdeploy.sh load`. This will load all DP Core docker images which are bundled in the tarballs into the local machine's docker repo. Note that doing this for the first Dataplane installation might take a while. 
* Run `./dpdeploy.sh init --all`
* cd /usr/dp/`buildnum`/apps/dlm/bin
* Run `./dlmdeploy.sh load`. This will load the DLM Service docker image into the local machine's docker repo. Note that doing this for the first Dataplane installation might take a while.
* Run `./dlmdeploy.sh init`
* Verify the services are up using `docker ps`. There must be 8 service containers that are running.

## CLI Reference

The script providing deployment and admnistration of DP Core is `dpdeploy.sh`. Following are the actions supported by it:

| Command           | Options                        | Default Value                                                                               |
|-------------------|--------------------------------|---------------------------------------------------------------------------------------------|
| init              | `[ --all  ]`                   | Initialize and start all containers for the first time                                      |
| migrate           |                                | Reset database to its pristine state and run schema migrations on it                        |
| utils add-host    | `<ip> <host>`                  | Append a single entry to `/etc/hosts` file of the container interacting with HDP clusters   |
| utils update-user | `[ ambari / atlas / ranger ]`  | Update user credentials for services that Dataplane will use to connect to clusters         |
| utils reload-apps |                                | Restart all containers other than database, Consul and Knox                                 |
| start             |                                | Start all containers                                                                        |
| stop              |                                | Stop all containers                                                                         |
| ps                |                                | List the status of associated docker containers                                             |
| logs              | `<container_name>`             | Logs of supplied container id or name                                                       |
| destroy           | `[ --all ]`                    | Kill all containers and remove them. Needs to start from init again                         |
| load              |                                | Load all images from `../lib` directory into docker daemon                                  |
| upgrade           | `--from <old_setup_directory>` | Upgrade existing `dp-core` to current version                                               |
| version           |                                | Print the version of dataplane                                                              |

## Bootstrap Configuration

Dataplane uses some configuration items to bootstrap itself.

| Configuration Item                        | Description    | Default Value    |
|-------------------------------------------|----------------|------------------|
| `USE_EXTERNAL_DB`                         | Set to `yes` for pointing to an external Postgres instance, no otherwise | `no` |
| `DATABASE_URI`                            | If `USE_EXTERNAL_DB` is `yes`, this must point to the external Database URI | |
| `DATABASE_USER`                           | If `USE_EXTERNAL_DB` is `yes`, this must point to the Dataplane Admin user name of the external Database URI | |
| `DATABASE_PASS`                           | If `USE_EXTERNAL_DB` is `yes`, this must point to the Dataplane Admin password of the external Database URI | |
| `SEPARATE_KNOX_CONFIG`                    | Set to `true` if a separate Knox instance is setup on HDP clusters for handling Dataplane traffic, false otherwise | `false` |
| `KNOX_CONFIG_USING_CREDS`                 | If `SEPARATE_KNOX_CONFIG` is `true`, when a cluster is registered, we must provide additional information to discover it. This is either using Ambari credentials or explicitly specifying the URL. Set to `true` if you want to use Ambari credentials, `false` for URL | `true` |
| `CONSUL_HOST`                             | Set to the IP address of the host where Dataplane containers are launched | |
| `MASTER_PASSWORD`                         | Set to the password to be used for Knox keystore configuration.  **IMPORTANT: This is in clear text and should typically not be set in production environments. Instead  specify it when prompted on command line.** | |
| `USE_TEST_LDAP`                           | Specifies whether to use an external LDAP instance or connect to a test LDAP instance that comes with the Dataplane Knox container | |
| `USE_TLS`                                 | Set to `true` to enable TLS / HTTPS | |
| `USE_PROVIDED_CERTIFICATES`               | Set to `yes` if you have public-private key-pair already generated/issued. Setting to `no` automatically generates a key-pair for you. | |
| `DATAPLANE_CERTIFICATE_PUBLIC_KEY_PATH`   | If `USE_PROVIDED_CERTIFICATES` is `yes`, this must point to the absolute path of public key file | |
| `DATAPLANE_CERTIFICATE_PRIVATE_KEY_PATH`  | If `USE_PROVIDED_CERTIFICATES` is `yes`, this must point to the absolute path of encrypted private key file | |
| `CERTIFICATE_PASSWORD`                    | If `USE_PROVIDED_CERTIFICATES` is `yes`, this should be the password required to decrypt the private key file.  **IMPORTANT: This is in clear text and should typically not to be set in production environments. Instead specify it when prompted on command line.** | |

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
USE_EXTERNAL_DB="yes"
DATABASE_URI="jdbc:postgresql://<host_name>:5432/<database_name>"
DATABASE_USER="<user_name>"
DATABASE_PASS="<password>"
```
9. Deploy dataplane as usual using `./dpdeploy.sh`

## Upgrading
Follow these steps in-order:
1. Ensure that new versions of all containers have been loaded into docker.
2. Switch to new `install` directory.
3. Load all new docker images using `./dpdeploy.sh load`.
3. Invoke `./dpdeploy.sh upgrade --from <old_setup_directory>`.

## Known Issues

* When trying with Centos 7, SE Linux needs to be disabled for now. This is a workaround to a bug that causes external volume mounts to fail. We will try and resolve this issue going forward.
  * The precise steps to disable are to run this command as root: `su -c "setenforce 0"`. The issue are workaround are documented [here](http://stackoverflow.com/questions/24288616/permission-denied-on-accessing-host-directory-in-docker)
