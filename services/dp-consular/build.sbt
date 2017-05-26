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