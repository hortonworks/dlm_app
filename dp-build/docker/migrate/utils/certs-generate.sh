#!/bin/bash

 openssl req \
    -x509 \
    -newkey rsa:4096 \
    -subj '/CN=dataplane' \
    -keyout /dp-shared/ssl-key.pem \
    -out /dp-shared/ssl-cert.pem \
    -passout pass:$CERTIFICATE_PASSWORD \
    -days 365
