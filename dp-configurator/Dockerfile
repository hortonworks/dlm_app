FROM openjdk:8-jre

COPY build /usr/dp-configurator
WORKDIR  /usr/dp-configurator/
CMD java -cp "dp-configurator-1.0-SNAPSHOT.jar:libs/*" com.hortonworks.dataplane.config.consulhost.ConsulIPConfigurator
