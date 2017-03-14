FROM openjdk:8-jre

# ONBUILD RUN sh ./build.sh

RUN apt-get update && \
    apt-get install -y ntp nginx runit

COPY ./webapp/target/universal/data_plane-0.1-alpha /usr/dp-services/data_plane-0.1-alpha
COPY ./ui/dist /usr/dp-web
COPY ./dp-build/services /etc/sv

RUN chmod +x /etc/sv/nginx/run && \
    chmod +x /etc/sv/play/run && \
    chmod +x /usr/dp-services/data_plane-0.1-alpha/bin/data_plane

EXPOSE 80

# TODO >> read VOLUME
# VOLUME /usr/share/nginx/html
# VOLUME /etc/nginx
# VOLUME /var/log/nginx/log

# ENTRYPOINT ["echo", "$PATH"]
ENTRYPOINT ["runsvdir", "/etc/sv"]
