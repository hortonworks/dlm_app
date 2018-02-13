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

RUN wget http://cdn.azul.com/zcek/bin/ZuluJCEPolicies.zip \
    && unzip -oj ZuluJCEPolicies.zip ZuluJCEPolicies/local_policy.jar -d /usr/lib/jvm/java-8-openjdk-amd64/jre/lib/security/ \
    && unzip -oj ZuluJCEPolicies.zip ZuluJCEPolicies/US_export_policy.jar -d /usr/lib/jvm/java-8-openjdk-amd64/jre/lib/security/ \
    && rm ZuluJCEPolicies.zip \
    && chmod -R 640 /usr/lib/jvm/java-8-openjdk-amd64/jre/lib/security/

COPY build/libs/* /usr/gateway-service/
COPY docker_service_start.sh docker_service_start.sh
RUN chmod +x docker_service_start.sh

EXPOSE 8762
ENTRYPOINT ["./docker_service_start.sh"]

