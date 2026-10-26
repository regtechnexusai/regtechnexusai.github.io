#!/bin/sh
set -eu

: "${MUKUL_API_PASSWORD:?MUKUL_API_PASSWORD must be set}"

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 \
  --set=api_password="$MUKUL_API_PASSWORD" \
  --set=db_name="$POSTGRES_DB" <<'SQL'
CREATE ROLE mukul_api
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOINHERIT
  PASSWORD :'api_password';
REVOKE CONNECT ON DATABASE :"db_name" FROM PUBLIC;
GRANT CONNECT ON DATABASE :"db_name" TO mukul_api;
SQL
