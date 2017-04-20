FROM openjdk:8-jre

COPY build/dp-cluster-service /usr/dp-cluster-service
EXPOSE 9009

ENTRYPOINT ["/usr/dp-cluster-service/bin/cluster-service"]
