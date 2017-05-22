# DLM

# Development Setup

## Requirements

* git
* JDK 8
* SBT 0.13.1 or above. To get SBT on Linux, you can do
  * `curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo`
  * `sudo yum install sbt`
* Nodejs 6.10.0 or above. To get Nodejs on Linux, you can follow instructions here: https://nodejs.org/en/download/package-manager/#enterprise-linux-and-fedora
* [Yarn](https://yarnpkg.com) package manager (`npm install --global yarn`)

## IntelliJ IDE

* Install scala plugin
* Create a new project by selecting: `File | New | Project from Existing Sources` and then opening build.sbt of dlm project
* When creating project as mentioned above choose JDK 1.8

## Compile and Start DLM app server

* Run `sbt publishLocal` from dataplane root directory to locally publish dataplane projects. This is required because dlm has dependency on `db-client` project of dataplane.
* Run `sbt compile` from dlm root directory to compile dlm-app and it's dlm dependencies.
* Run `sh runDlmApp.sh ` to start dlm app server on 9005 port 

## Compile and Start DLM web server

* Run `yarn; npm run prod` for server to run in prod mode. Navigate to `http://localhost:4444`.








