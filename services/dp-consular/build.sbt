/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

name := """dp-consular"""


Common.settings

libraryDependencies ++= Seq(
  // Uncomment to use Akka
  //"com.typesafe.akka" % "akka-actor_2.11" % "2.3.9",
  "junit"             % "junit"           % "4.12"  % "test",
  "com.novocode"      % "junit-interface" % "0.11"  % "test"
)
// https://mvnrepository.com/artifact/com.netflix.hystrix/hystrix-core
libraryDependencies += "com.ecwid.consul" % "consul-api" % "1.2.2"
libraryDependencies += "com.typesafe" % "config" % "1.3.1"
libraryDependencies += "com.netflix.ribbon" % "ribbon-loadbalancer" % "2.2.2"
// https://mvnrepository.com/artifact/com.netflix.ribbon/ribbon
libraryDependencies += "com.netflix.ribbon" % "ribbon" % "2.2.2"
libraryDependencies += "org.springframework.cloud" % "spring-cloud-commons" % "1.2.2.RELEASE"
libraryDependencies := libraryDependencies.value.map(_.excludeAll(ExclusionRule("com.google.code.findbugs", "annotations")))
