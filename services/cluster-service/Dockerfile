FROM openjdk:8-jre

COPY ./dp-cluster-service /usr/dp-cluster-service
EXPOSE 9009
EXPOSE 9010
COPY docker_service_start.sh docker_service_start.sh
RUN chmod +x docker_service_start.sh
ENTRYPOINT ["./docker_service_start.sh"]
