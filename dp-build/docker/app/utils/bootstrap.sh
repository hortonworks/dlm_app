#!/bin/bash

echo -n "$CERTIFICATE_PASSWORD" > /ssl-key.pem.password

runsvdir /etc/sv
