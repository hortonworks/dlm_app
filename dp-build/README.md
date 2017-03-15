# Docker Build

## mongo

* prebuilt MongoDB distributed via Docker Hub.
* this image is not modified.

## hortonworks/data-plane-setup

* generated from `./dp-setup`
* derieved from `python:2.7`
* generates a **short-lived** container which uses Python to do the following:
    1. Initialize MongoDB by creating default `data_plane` database and create user `dp_admin` to access it.

## hortonworks/data-plane

* generated from `./services` and `./dp-web`
* derieved from `openjdk:8-jre` which in turn is derieved from `debian:jessie` [because installing jdk8 on Debian is hard / broken]
* installs and uses [`runit`](smarden.org/runit/) as process supervisor
* installs and uses `nginx` as gateway / proxy for play app and to serve static assets, i.e. Web
* `runit` starts and manages both nginx and the play application
* Exposes `port 80` for consumption


