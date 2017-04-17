FROM openjdk:8-jre

RUN apt-get update && \
    apt-get install -y ntp nginx runit net-tools vim

COPY ./build/dp-app /usr/dp-app
COPY ./build/dp-web /usr/dp-web
COPY ./build/dlm-web /usr/dlm-web
COPY ./services /etc/sv

RUN chmod +x /etc/sv/nginx/run && \
    chmod +x /etc/sv/play/run && \
    chmod +x /usr/dp-app/bin/dp-app

RUN rm -rf /etc/sv/getty-5

EXPOSE 80

ENTRYPOINT ["runsvdir", "/etc/sv"]
