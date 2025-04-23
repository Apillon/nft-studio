#!/bin/bash

set -e
[[ -f .env ]] && source .env

docker build \
    --build-arg APP_ENV \
    --build-arg APP_SECRET \
    --build-arg APP_URL \
    --build-arg API_PORT \
    --build-arg API_HOST \
    --build-arg LOG_TARGET \
    --build-arg PAGE_DEFAULT_LIMIT \
    --build-arg PAGE_MAX_LIMIT \
    --build-arg MYSQL_HOST \
    --build-arg MYSQL_PORT \
    --build-arg MYSQL_DATABASE \
    --build-arg MYSQL_USER \
    --build-arg MYSQL_PASSWORD \
    --build-arg MYSQL_POOL \
    --build-arg MYSQL_HOST_TEST \
    --build-arg MYSQL_PORT_TEST \
    --build-arg MYSQL_DATABASE_TEST \
    --build-arg MYSQL_USER_TEST \
    --build-arg MYSQL_PASSWORD_TEST \
    --build-arg MYSQL_POOL_TEST \
    --build-arg ADMIN_WALLET \
    --build-arg APILLON_KEY \
    --build-arg APILLON_API_URL \
    --build-arg APILLON_SECRET \
    --build-arg COLLECTION_UUID \
    --build-arg MAX_SUPPLY \
    --build-arg SMTP_HOST \
    --build-arg SMTP_PORT \
    --build-arg SMTP_USERNAME \
    --build-arg SMTP_PASSWORD \
    --build-arg SMTP_EMAIL_FROM \
    --build-arg SMTP_NAME_FROM \
    --build-arg SMTP_EMAIL_FROM_HELLO \
    --build-arg CAPTCHA_SECRET \
    --build-arg CLAIM_EXPIRES_IN \
    --build-arg SIGNATURE_PRIVATE_KEY \
    --build-arg SIGNATURE_CONTRACT_ADDRESS \
    --build-arg CLAIM_START \
    -t nft-studio .

docker tag nft-studio nft-studio:latest