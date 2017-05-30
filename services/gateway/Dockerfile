FROM openjdk:8-jre

COPY build/libs/* /usr/gateway-service/
COPY docker_service_start.sh docker_service_start.sh
RUN chmod +x docker_service_start.sh

EXPOSE 8762
ENTRYPOINT ["./docker_service_start.sh"]

