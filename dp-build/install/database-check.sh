#!/bin/bash
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

# # The following does not work, since postgresql server is ready twice
# # https://github.com/docker-library/postgres/issues/146#issuecomment-215619771
# until docker exec -t dp-database pg_isready --dbname=dataplane --username=dp_admin; do
#   echo "Waiting for PostgreSQL..."
#   sleep 2
# done

echo -n "Waiting for postgres server..."
until docker exec -t dp-database psql -U dp_admin -d dataplane -c "select 1" > /dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo $'\nPostgres server is ready.'
