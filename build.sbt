name := """dataplane"""

Common.settings

lazy val dpCommons = (project in file("dp-commons"))

lazy val dbClient = (project in file("clients/db-client")).
  dependsOn(dpCommons)

lazy val atlas = (project in file("services/atlas/service")).
  dependsOn(dpCommons)

lazy val dbService = (project in file("services/db-service")).enablePlugins(PlayScala).
  dependsOn(dpCommons)

lazy val dpApp = (project in file("dp-app")).enablePlugins(PlayScala).
  dependsOn(dbClient, atlas)

