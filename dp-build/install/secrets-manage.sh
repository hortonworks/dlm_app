#!/bin/bash

if [ "$USE_EXT_DB" == "yes" ]; then
    T_SOCKET=$(echo $DATABASE_URI | awk -F/ '{print $3}')
    DB_NAME=$(echo $DATABASE_URI | awk -F/ '{print $4}')
    DB_HOST=$(echo $T_SOCKET | awk -F: '{print $1}')
    DB_PORT=$(echo $T_SOCKET | awk -F: '{print $2}')
    if [ -z "$DB_PORT" ]; then
        DB_PORT="80"
    fi
    DB_USER="$DATABASE_USER"
    DB_PASS="$DATABASE_PASS"
else
    DB_NAME="dataplane"
    DB_HOST="$DB_CONTAINER"
    DB_PORT="5432"
    DB_USER="dp_admin"
    DB_PASS="dp_admin"
fi

add_secret() {
    ALIAS=$1
    USERNAME=$2
    PASSWORD=$3

    QUERIES="UPDATE dataplane.configs SET config_value = '$USERNAME' WHERE config_key = '$ALIAS';
             UPDATE dataplane.configs SET config_value = '$PASSWORD' WHERE config_key = '$ALIAS.password';"

    echo "Updating DB $DB_NAME at $DB_HOST..."

    docker run \
        --network dp \
        --tty \
        --rm \
        --env "PGHOST=$DB_HOST" \
        --env "PGPORT=$DB_PORT" \
        --env "PGUSER=$DB_USER" \
        --env "PGPASSWORD=$DB_PASS" \
        --env "PGDATABASE=$DB_NAME" \
        --entrypoint "psql" \
        postgres:9.6.3-alpine \
            -c "$QUERIES"
}

AMBARI_ALIAS="dp.ambari.superuser"
if [ -z "$AMBARI_USERNAME" ] || [ -z "$AMBARI_PASSWORD" ]; then
    echo "Please enter username of a user which has access rights on all Ambari clusters:"
    read AMBARI_USERNAME
    echo "Please enter password for the user:"
    read -s AMBARI_PASSWORD
fi
add_secret "$AMBARI_ALIAS" "$AMBARI_USERNAME" "$AMBARI_PASSWORD"

echo "Ambari secret successfully persisted to DB."
