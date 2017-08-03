# Generating Licenses for libraries used.

## For sbt 
Tool used: https://github.com/sbt/sbt-license-report
Go to root project (Eg dataplane)
For each of the projec configured (see build.sbt ) dumpLicenseReport. Reports are generated in target\license-reports
>sbt ";project consul;dumpLicenseReport"
>sbt ";project csClient;dumpLicenseReport"
>sbt ";project gatewayClient;dumpLicenseReport"
>sbt ";project restMock;dumpLicenseReport"
>sbt ";project dpApp;dumpLicenseReport"
>sbt ";project knoxAgent;dumpLicenseReport"
>sbt ";project clusterService;dumpLicenseReport"
>sbt ";project dbService;dumpLicenseReport"


## For Gradle
Tool used: https://github.com/RobertFischer/Gradle-License-Report
Go to the project directory (eg. dataplane\services\gateway)
>gradle dependencyLicenseReport

## For Maven
Tool used: Default maven
Go to the project directory (eg. dataplane\dp-configurator)
>mvn site
>target\site\dependencies.html contains the report

