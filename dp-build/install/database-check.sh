#!/bin/bash

# # The following does not work, since postgresql server is ready twice
# # https://github.com/docker-library/postgres/issues/146#issuecomment-215619771
# until docker exec -t dp-database pg_isready --dbname=dataplane --username=dp_admin; do
#   echo "Waiting for PostgreSQL..."
#   sleep 2
# done

until docker exec -t dp-database psql -U dp_admin -d dataplane -c "select 1" > /dev/null 2>&1; do
  echo "Waiting for postgres server..."
  sleep 1
done

