#!/bin/sh
docker-compose -f docker-compose.yml -f docker-compose-migrate.yml up -d
