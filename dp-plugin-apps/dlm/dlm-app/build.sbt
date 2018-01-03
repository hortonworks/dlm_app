/**
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
  "com.fasterxml.jackson.module" % "jackson-module-scala_2.11" % "2.9.1",
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test,
  "org.mockito" % "mockito-all" % "1.10.19" % Test

)

libraryDependencies := libraryDependencies.value.map(_.excludeAll(ExclusionRule("com.google.code.findbugs", "annotations")))

routesGenerator := InjectedRoutesGenerator
