FROM openjdk:8-jre

COPY ./dp-db-service /usr/dp-db-service
EXPOSE 9000

ENTRYPOINT ["/usr/dp-db-service/bin/db-service", "-Dconfig.resource=application.docker.conf", "-Dplay.crypto.secret=20390398"]
