FROM openjdk:8-jre

COPY target/dp-configurator-1.0-SNAPSHOT.jar /usr/dp-configurator/
CMD java -jar /usr/dp-configurator/dp-configurator-1.0-SNAPSHOT.jar com.hortonworks.dataplane.config.consulhost.ConsulIPConfigurator

