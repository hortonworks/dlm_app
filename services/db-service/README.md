Storage service
=================================

This service provides a data store and an API for data plane.



Run the service
===========

Install flyway through homebrew - `brew install flyway`

Change the DB parameters in `db/flyway.onf` and then run `flyway clean migrate`

Change DB connection parameters in `application.conf`

`activator run` or `sbt ~run`

