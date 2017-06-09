FROM openjdk:8-jre

RUN apt-get update && \
    apt-get install -y ntp nginx runit net-tools vim

COPY ./dlm-app /usr/dlm-app
COPY ./dlm-web /usr/dlm-web
COPY ./services /etc/sv

RUN chmod +x /etc/sv/play/run && \
    chmod +x /usr/dlm-app/bin/dlm-app

RUN rm -rf /etc/sv/getty-5
RUN mkdir -p /usr/dlm-app/bin/logs/ && touch /usr/dlm-app/bin/logs/application.log
RUN ln -sf /dev/stdout /usr/dlm-app/bin/logs/application.log
EXPOSE 9011

ENTRYPOINT ["runsvdir", "/etc/sv"]
