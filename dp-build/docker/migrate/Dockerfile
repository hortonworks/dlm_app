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
FROM openjdk:8-jre-alpine

ENV FLYWAY_VERSION 4.2.0
ENV FLYWAY_SQL_DIR /dbscripts
ENV GA_TRACKING_ID GA_TRACKING_ID_VALUE_TO_REPLACE

RUN mkdir -p /opt $FLYWAY_SQL_DIR \
    && apk --no-cache add bash wget ca-certificates openssl postgresql-client \
    && update-ca-certificates \
    && wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz | tar -xzf- -C /opt \
    && ln -s /opt/flyway-${FLYWAY_VERSION} /opt/flyway \
    && ln -s /opt/flyway/flyway /usr/local/bin/flyway \
    && apk del wget

COPY ./bcrypter /bcrypter
COPY ./dbscripts /dbscripts 
COPY ./utils /scripts

ENTRYPOINT ["bash"]
CMD ["--help"]
