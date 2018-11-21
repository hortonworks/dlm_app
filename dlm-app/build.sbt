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
  "org.scala-lang" % "scala-reflect" % "2.11.12", // https://www.scala-lang.org/news/security-update-nov17.html
  "com.fasterxml.jackson.core" % "jackson-databind" % "2.9.5", // https://github.com/FasterXML/jackson-databind/issues/1931
  "ch.qos.logback" % "logback-classic" % "1.2.3", // https://issues.apache.org/jira/browse/ARROW-1240
  "org.springframework.security" % "spring-security-crypto" % "4.2.3.RELEASE",
  "com.google.guava" % "guava" % "24.1.1-jre",
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test,
  "org.mockito" % "mockito-all" % "1.10.19" % Test

)

routesGenerator := InjectedRoutesGenerator
