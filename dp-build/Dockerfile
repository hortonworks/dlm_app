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
COPY ./dlm-web /usr/dlm-web
COPY ./services /etc/sv
COPY nginx.ctmpl /etc/ctmpl

RUN chmod +x /etc/sv/nginx/run && \
    chmod +x /etc/sv/play/run && \
    chmod +x /usr/dp-app/bin/dp-app && \
    chmod +x /etc/sv/consul_template/run

RUN rm -rf /etc/sv/getty-5
RUN mkdir -p /usr/dp-app/bin/logs/ && touch /usr/dp-app/bin/logs/application.log
RUN ln -sf /dev/stdout /usr/dp-app/bin/logs/application.log
EXPOSE 80
EXPOSE 9000
ENTRYPOINT ["runsvdir", "/etc/sv"]
