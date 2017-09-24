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
FROM openjdk:8-jre-slim

ENV HDP_VERSION=2.6.2.0-189
RUN apt-get update && \
    apt-get install -y gnupg wget procps && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys B9733A7A07513CAD && \
    wget http://s3.amazonaws.com/dev.hortonworks.com/HDP/ubuntu16/2.x/BUILDS/${HDP_VERSION}/hdpbn.list -P /etc/apt/sources.list.d/ && \
    apt-get update && \
    apt-get install -y knox && \
    apt-get clean all

ENV CONSUL_VERSION=0.8.5
RUN wget https://releases.hashicorp.com/consul/${CONSUL_VERSION}/consul_${CONSUL_VERSION}_linux_amd64.zip && \
    unzip -d /bin consul_${CONSUL_VERSION}_linux_amd64.zip && \
    rm consul_${CONSUL_VERSION}_linux_amd64.zip

COPY ./utils /scripts
COPY ./dp-knox-agent /usr/dp-knox-agent

EXPOSE 8300 8301 8301/udp 8302 8302/udp 8400 8500 53/udp
ENV sso.toplology.path=/usr/hdp/current/knox-server/conf/topologies/knoxsso.xml

ENTRYPOINT ["bash", "/scripts/knox-start.sh"]
