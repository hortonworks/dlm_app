FROM openjdk:8-jre

RUN apt-get update && \
    apt-get install -y ntp nginx runit net-tools vim

COPY ./dp-app /usr/dp-app
COPY ./dp-web /usr/dp-web
COPY ./dlm-web /usr/dlm-web
COPY ./services /etc/sv

RUN chmod +x /etc/sv/nginx/run && \
    chmod +x /etc/sv/play/run && \
    chmod +x /usr/dp-app/bin/dp-app

RUN rm -rf /etc/sv/getty-5
RUN mkdir -p /usr/dp-app/bin/logs/ && touch /usr/dp-app/bin/logs/application.log
RUN ln -sf /dev/stdout /usr/dp-app/bin/logs/application.log
EXPOSE 80

ENTRYPOINT ["runsvdir", "/etc/sv"]
