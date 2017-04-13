FROM openjdk:8-jre

# ONBUILD RUN sh ./build.sh

RUN apt-get update && \
    apt-get install -y ntp nginx runit net-tools vim

COPY ./build/dp-app /usr/dp-app
COPY ./build/dp-web /usr/dp-web
COPY ./build/dlm-web /usr/dlm-web
COPY ./services /etc/sv

RUN chmod +x /etc/sv/nginx/run && \
    chmod +x /etc/sv/play/run && \
    chmod +x /usr/dp-app/bin/dp-app

EXPOSE 80

# TODO >> read VOLUME
# VOLUME /usr/share/nginx/html
# VOLUME /etc/nginx
# VOLUME /var/log/nginx/log

# ENTRYPOINT ["echo", "$PATH"]
ENTRYPOINT ["runsvdir", "/etc/sv"]
