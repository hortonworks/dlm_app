/**
  *  HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
  *
  *  (c) 2016-2018 Hortonworks, Inc. All rights reserved.
  *
  *  This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
  *  of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
  *  authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
  *  an authorized and properly licensed third party, you do not have any rights to this code.
  *
  *  If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
  *  WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
  *  RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
  *  AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
  *  OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
  *  TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
  *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
  *  DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
  *  OR LOSS OR CORRUPTION OF DATA.
  */

name := """dlm-app"""

Common.settings

incOptions := incOptions.value.withNameHashing(true)
updateOptions := updateOptions.value.withCachedResolution(cachedResoluton = true)

resolvers += "Hortonworks Nexus Private" at "http://nexus-private.hortonworks.com/nexus/content/repositories/public"

libraryDependencies ++= Seq(
  cache,
  //service dependencies
  "io.jsonwebtoken" % "jjwt" % "0.7.0",
  "com.typesafe.play" % "play-json_2.11" % "2.6.0-M3",
  "com.hortonworks.dataplane" %% "db-client" % "1.0",
  "com.hortonworks.dataplane" %% "cs-client" % "1.0",
  "com.hortonworks.dataplane" %% "dp-consular" % "1.0",
  "io.dropwizard.metrics" % "metrics-jvm" % "3.2.5",
  "com.amazonaws" % "aws-java-sdk" % "1.11.46",
  "commons-lang" % "commons-lang" % "2.6",
  "com.microsoft.azure" % "azure-storage" % "6.1.0",
  "com.microsoft.azure" % "azure-data-lake-store-sdk" % "2.1.5",
  "com.fasterxml.jackson.module" % "jackson-module-scala_2.11" % "2.9.1",
  "ch.qos.logback" % "logback-core" % "1.1.11",
  "ch.qos.logback" % "logback-classic" % "1.1.11",
  "xerces" % "xercesImpl" % "2.11.0.SP1",
  "org.springframework.security" % "spring-security-crypto" % "4.2.3.RELEASE",
  "com.fasterxml.jackson.core" % "jackson-databind" % "2.9.3",
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test,
  "org.mockito" % "mockito-all" % "1.10.19" % Test

)

libraryDependencies := libraryDependencies.value.map(_.excludeAll(ExclusionRule("com.google.code.findbugs", "annotations")))

routesGenerator := InjectedRoutesGenerator
