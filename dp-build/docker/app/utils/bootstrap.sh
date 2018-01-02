#!/bin/bash

echo -n "$CERTIFICATE_PASSWORD" > /ssl-key.pem.password

if [ -z "$ROOT_PATH" ]; then
    export ROOT_PATH="/"
fi

runsvdir /etc/sv
