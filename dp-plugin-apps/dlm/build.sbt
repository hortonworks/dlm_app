name := """dlm"""

Common.settings

lazy val beaconClient = (project in file("clients/beacon-client"))

lazy val webhdfsClient = (project in file("clients/webhdfs-client"))  

lazy val dlmApp = (project in file("dlm-app")).enablePlugins(PlayScala).dependsOn(beaconClient, webhdfsClient)

