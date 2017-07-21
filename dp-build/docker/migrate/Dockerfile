FROM java:openjdk-8-jre-alpine

ENV FLYWAY_VERSION 4.2.0
ENV FLYWAY_SQL_DIR /dbscripts

RUN mkdir -p /opt $FLYWAY_SQL_DIR \
    && apk --no-cache add wget ca-certificates \
    && update-ca-certificates \
    && wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz | tar -xzf- -C /opt \
    && mv /opt/flyway-${FLYWAY_VERSION} /opt/flyway \
    && sed -i 's/bash/sh/' /opt/flyway/flyway \
    && ln -s /opt/flyway/flyway /usr/local/bin/flyway \
    && apk del wget ca-certificates

COPY ./utils/entry.sh /entry.sh
COPY ./dbscripts /dbscripts 

ENTRYPOINT ["/entry.sh"]
CMD ["--help"]
