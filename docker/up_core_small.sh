#!/bin/sh
echo "Starting Core without Airflow (small version)..."
echo "\n"
ENV_FILE=.env
if test -f "$ENV_FILE"; then
    echo "using $ENV_FILE"
else
  ENV_FILE=.env.default
  echo "using $ENV_FILE"
fi
echo "\n"
docker compose -f docker-compose.yml --env-file $ENV_FILE up -d
docker compose -f docker-compose.keycloak.yml --env-file $ENV_FILE up -d --force-recreate
