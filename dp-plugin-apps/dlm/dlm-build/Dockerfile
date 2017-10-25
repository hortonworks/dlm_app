#
# /*
#  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
#  *
#  * Except as expressly permitted in a written agreement between you or your company
#  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
#  * reproduction, modification, redistribution, sharing, lending or other exploitation
#  * of all or any part of the contents of this software is strictly prohibited.
#  */
#
FROM openjdk:8-jre

RUN apt-get update && \
    apt-get install -y runit

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
