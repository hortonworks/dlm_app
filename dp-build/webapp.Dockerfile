FROM openjdk:8-jdk

# install SBT
RUN apt-get update
# RUN apt-get install -y apt-utils
RUN apt-get install -y apt-transport-https
RUN echo "deb https://dl.bintray.com/sbt/debian /" | tee -a /etc/apt/sources.list.d/sbt.list
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 642AC823
RUN apt-get update
RUN apt-get -y install sbt

ENV SBT_OPTS="-Xmx1200M -Xss512K -XX:MaxMetaspaceSize=512M -XX:MetaspaceSize=300M"

# make SBT dependencies an image layer: no need to update them on every container rebuild
# COPY project/build.properties /setup/project/build.properties
# RUN cd /setup
# RUN sbt test
# RUN cd /
# RUN rm -r /setup

ADD ./dpservice /var/tmp/deps/dpservice
#COPY  /var/tmp/deps/dpservice

ADD ./services/atlas/service /var/tmp/deps/services/atlas/service
#COPY  /var/tmp/deps/services/atlas/service

#RUN mkdir -p /usr/dp-services
ADD ./webapp /usr/dp-services

WORKDIR /var/tmp/deps/dpservice
RUN sbt publishLocal

WORKDIR /var/tmp/deps/services/atlas/service
RUN sbt publishLocal

WORKDIR /usr/dp-services

# Install app dependencies
RUN sbt compile

EXPOSE 9000

CMD [ "sbt", "-v", "run", "-Dconfig.resource=docker.conf" ]

# Source
# http://rgg.zone/2017/01/06/using-docker-development-environment-setup-automation/
