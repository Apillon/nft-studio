# NFT Studio Backend

## Overview

NFT Studio Backend is a containerized application providing backend services for NFT Studio Simplet.

IMPORTANT: The `nft_studio_app` service defined in [docker-compose.yml](./docker-compose.yml) uses an 
image from the public Docker registry (apillon/nft-studio:latest) therefore any changes to the backend 
code require building and publishing a new Docker image.

## Docker Image Build and Publish Process

1. Build the Docker image:
    - Run [build-image.sh](./build-image.sh)

2. Publish to registry:
    - Run [publish.sh](./publish.sh)