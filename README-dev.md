# Dataplane

## Requirements

* Git
* JDK 8
* SBT 0.13.1 or above. To get SBT on Mac, you can do
  * `brew install sbt`
* Gradle 3.5 or above. To get Gradle on on Mac, you can do
  * `brew install gradle`
* Nodejs 6.10.0 or above. To get NodeJS on Mac, you can use
  * `brew install nodejs`
* [Yarn](https://yarnpkg.com) package manager (`npm install --global yarn`)
* POSTGRESQL. Using brew, it can be installed via `brew install postgresql`
* Flyway. Using brew, it can be installed via `brew install flyway`
* Consul, which can be downloaded from https://www.consul.io/downloads.html
* Centos 7 or Mac OSX are tested platforms

## Run

1. Start Consul agent in DEV mode
  * Place consul binary on path
  * Use command `consul agent -dev`
  * Consul console can be checked at http://localhost:8500/
2. Start Zuul
  * Navigate to `<project_parent>/dataplane/services/gateway`
  * Run command `gradle bootRun`
3. Start and setup DB
  * `createdb dataplane`
  * Navigate to `<project_parent>/dataplane/services/db-service/db`
  * Run `flyway migrate`
4. Start Play BE
  * `sh runDbService.sh` for db service
  * `sh runDpApp.sh` for app
  * `sh runClusterService.sh` for cluster service

  `dp-app` and `cluster-service` need to be supplied with keystore path and password as `dp.keystore.path` and `Ddp.keystore.password` as environment variables. This is already handled if you have been using pre-provided scripts.

5. Start UI
  * `yarn install --frozen-lockfile`
  * `yarn run dev`

## Troubleshooting

1. Zuul forward errors in response instead of proper response from targeted systems
  * Check in Consul console if all systems are up and registered.

