# Dataplane

## Requirements

* Git
* JDK 8 with JCE installed and enabled. You can do so with `brew cask reinstall java8` and then updating `/Library/Java/JavaVirtualMachines/<your_version>/Contents/Home/jre/lib/security/java.security` to set the value “crypto.policy=unlimited”. This line should already be there. You just need to uncomment it.
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
2. Setup Knox
  * Download and extract knox
  * Navigate to <KNOX_HOME>
  * Run `./bin/knoxcli.sh create-master` to create a master password for knox gateway
  * Export knox certificate using command `keytool -export -alias gateway-identity -storepass <knox_gateway_master_password> -keystore <KNOX_HOME>/data/security/keystores/gateway.jks -rfc > <path to cert file>`
  * In `<project_parent>/dataplane/services/gateway/src/main/resources/application-zuul.properties` update :
  ```
     signing.pub.key.path to path of the cert file generated in the previous step
     sso.enabled to true
     sso.cookie.domain to localhost
  ```    
  * Edit `<KNOX_HOME>/conf/topologies/knoxsso.xml` and set value of
  ```
     knoxsso.cookie.secure.only to false
     knoxsso.redirect.whitelist.regex to http://localhost:4200/
  ```    
  * Navigate to <KNOX_HOME> and run `./bin/ldap.sh start` to start ldap and `./bin/gateway.sh start` to start knox  
3. Start Zuul
  * Generate an RSA key-pair with the following command:
  ```
  openssl req \
    -x509 \
    -newkey rsa:4096 \
    -subj '/CN=dataplane' \
    -keyout /some/where/on/your/local/path/ssl-key.pem \
    -out /some/where/on/your/local/path/ssl-cert.pem \
    -passout pass:"changeit" \
    -days 365
  ```
  * Update `dataplane/services/gateway/src/main/resources/application-zuul.properties` to set the values for following properties:
  ```
  # configuration for JWT signing keys. Need to be overridden
  jwt.public.key.path=/some/where/on/your/local/path/ssl-cert.pem
  jwt.private.key.path=/some/where/on/your/local/path/ssl-key.pem
  jwt.private.key.password=changeit
  ```
  * Navigate to `<project_parent>/dataplane/services/gateway`
  * Run command `gradle bootRun`
4. Start and setup DB
  * `createdb dataplane`
  * Navigate to `<project_parent>/dataplane/services/db-service/db`
  * Run `flyway migrate`
5. Start Play BE
  * `sh scripts/runDbService.sh` for db service
  * `sh scripts/runDpApp.sh` for app
  * `sh scripts/runClusterService.sh` for cluster service

  `dp-app` and `cluster-service` need to be supplied with keystore path and password as `dp.keystore.path` and `Ddp.keystore.password` as environment variables. This is already handled if you have been using pre-provided scripts.
  
6. Start UI
  * `yarn install --pure-lockfile`
  * `yarn run dev`

## Troubleshooting

1. Zuul forward errors in response instead of proper response from targeted systems
  * Check in Consul console if all systems are up and registered.
