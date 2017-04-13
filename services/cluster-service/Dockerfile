FROM openjdk:8-jre

COPY target/scala-2.11/cluster-service-assembly-0.5.jar /usr/dp-cluster-service/
CMD ["java", "-Ddp.services.db.service.uri=http://dp-db-service:9000", "-jar", "/usr/dp-cluster-service/cluster-service-assembly-0.5.jar"]
