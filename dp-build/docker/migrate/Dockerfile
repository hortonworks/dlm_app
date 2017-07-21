FROM java:openjdk-8-jre-alpine

ENV FLYWAY_VERSION 4.2.0
ENV FLYWAY_SQL_DIR /dbscripts

COPY ./utils/entry.sh /entry.sh
COPY ./dbscripts $FLYWAY_SQL_DIR

RUN mkdir -p /opt \
    && apk --no-cache wget ca-certificates \
    && update-ca-certificates \
    && wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz | tar -xzf- -C /opt \
    && mv /opt/flyway-${FLYWAY_VERSION} /opt/flyway \
    && sed -i 's/bash/sh/' /opt/flyway/flyway \
    && ln -s /opt/flyway/flyway /usr/local/bin/flyway \
    && apk del wget ca-certificates 

ENTRYPOINT ["/entry.sh"]
CMD ["--help"]
