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
    apt-get install -y ntp nginx runit net-tools vim

ENV CONSUL_TEMPLATE_VERSION 0.12.1
ADD https://releases.hashicorp.com/consul-template/${CONSUL_TEMPLATE_VERSION}/consul-template_${CONSUL_TEMPLATE_VERSION}_linux_amd64.zip /tmp/consul-template.zip

RUN unzip /tmp/consul-template.zip -d /usr/bin && \
    chmod +x /usr/bin/consul-template && \
    rm /tmp/consul-template.zip

COPY ./dp-app /usr/dp-app
COPY ./dp-web /usr/dp-web
COPY ./utils/services /etc/sv
COPY ./utils/bootstrap.sh /bootstrap.sh

RUN chmod +x /bootstrap.sh && \
    chmod +x /etc/sv/nginx/run && \
    chmod +x /etc/sv/play/run && \
    chmod +x /usr/dp-app/bin/dp-app && \
    chmod +x /etc/sv/consul_template/run

RUN rm -rf /etc/sv/getty-5
RUN mkdir -p /usr/dp-app/bin/logs/ && touch /usr/dp-app/bin/logs/application.log
RUN ln -sf /dev/stdout /usr/dp-app/bin/logs/application.log
EXPOSE 80 443 9000
ENTRYPOINT ["/bootstrap.sh"]
