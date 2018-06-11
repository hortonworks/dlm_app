<!---
  HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
  
  (c) 2016-2018 Hortonworks, Inc. All rights reserved.
  
  This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
  of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
  authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
  an authorized and properly licensed third party, you do not have any rights to this code.
  
  If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
  WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
  RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
  AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
  OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
  TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
  DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
  OR LOSS OR CORRUPTION OF DATA.
-->

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
* Run `sh runDlmApp.sh ` to start dlm app server on 9011 port

## Compile and Start DLM web server

* Run `yarn; npm run prod` for server to run in prod mode. Navigate to `http://localhost:4444`.
