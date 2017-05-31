name := """dataplane"""

Common.settings

lazy val dpCommons = (project in file("dp-commons"))

lazy val consul = (project in file("services/dp-consular"))

lazy val dbClient = (project in file("clients/db-client")).
  dependsOn(dpCommons)

lazy val csClient = (project in file("clients/cs-client")).
  dependsOn(dpCommons)

lazy val atlas = (project in file("services/atlas/service")).
  dependsOn(dpCommons)

lazy val restMock = (project in file("services/rest-mock"))

lazy val dbService = (project in file("services/db-service")).enablePlugins(PlayScala).
  dependsOn(dpCommons,consul)

lazy val dpApp = (project in file("dp-app")).enablePlugins(PlayScala).
  dependsOn(dbClient, csClient, atlas,consul)

lazy val clusterService = (project in file("services/cluster-service")).
  dependsOn(restMock, dpCommons,dbClient, csClient,consul)
