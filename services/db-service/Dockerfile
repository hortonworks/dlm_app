FROM openjdk:8-jre

COPY ./dp-db-service /usr/dp-db-service
EXPOSE 9000
COPY docker_service_start.sh docker_service_start.sh
RUN chmod +x docker_service_start.sh

EXPOSE 9000
ENTRYPOINT ["./docker_service_start.sh"]
