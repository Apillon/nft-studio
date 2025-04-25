# Backend for NFT Studio Simplet

This repository contains source code for the backend API service of NFT Studio Simplet.

NFT Studio Backend is a containerized application providing backend services for NFT Studio Simplet.

## Getting Started

This backend service is designed to be containerized and used with Docker.

### Prerequisites

- Docker

- Docker Compose

- Apillon account (to generate API key and NFT collection)

### Run Locally

First, configure your environment variables as described below. Then build and start the service:

```sh
./build-image.sh
docker compose up -d
```

To publish a new version of the Docker image to the registry:

```sh
./publish.sh
```

IMPORTANT: The `nft_studio_app` service defined in [docker-compose.yml](./docker-compose.yml) uses an
image from the public Docker registry (apillon/nft-studio:latest) therefore any changes to the backend
code require building and publishing a new Docker image.

### Endpoints

| Route                                        | Description                                                                    | Authentication required |
| -------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| GET `/`                                      | Return API status                                                              | false                   |
| POST `/login`                                | Admin wallet login                                                             | false                   |
| POST `/users`                                | Creates new users to airdrop nfts to                                           | true                    |
| POST `/claim`                                | Endpoint for claim - Mint NFT to specified wallet address                      | false                   |
| POST `/claim-admin`                          | Endpoint for minting NFT by user ID                                            | true                    |
| POST `/claim-airdrop`                        | Endpoint for minting NFT using the JWT token sent to the user's email          | false                   |
| POST `/claim-validate`                       | Endpoint for validating wallet address for NFT mint                            | false                   |
| POST `/claim-whitelist`                      | Endpoint for getting the claim signature                                       | false                   |
| GET `/users`                                 | Gets a list of all users                                                       | true                    |
| GET `/users/:id`                             | Gets specifics for one user                                                    | true                    |
| GET `/users/statistics`                      | Gets airdrop statistics                                                        | true                    |
| GET/PUT/POST/DELETE `/poap-drops`            | CRUD endpoints for POA drops                                                   | true                    |
| GET `/nft-collections`                       | Endpoint to get collections from Apillon platform                              | true                    |
| GET `/poap-drops/:id/drop-reservation-token` | Endpoint to generate jwt for reservation (qr code)                             | true (token from email) |
| POST `/poap-drops/:id/reserve-drop`          | Endpoint to reserve nft drop. User recieves email with instructions for mint   | true (token from email) |
| GET `/ipns-link/:cid/`                       | Generates signed IPFS/IPNS link from file CID                                  | false                   |
| GET `/project`                               | Endpoint for fetching project's credit balance                                 | false                   |
| POST `/send-claim-mail`                      | Endpoint for admin to send claim mail to all users with PENDING airdrop_status | true                    |

### Environment variables

- `APP_ENV`: App's environment
- `APP_SECRET`: Secret used to sign tokens
- `APP_URL`: URL of the frontend
- `LOG_TARGET`: Log level

- `API_HOST`: Hostname of the application
- `API_PORT`: Port where BE server should run

- `MYSQL_HOST`: Host of the MySQL database
- `MYSQL_PORT`: Port of the MySQL database
- `MYSQL_DATABASE`: Name of the MySQL database
- `MYSQL_USER`: Username for the MySQL database
- `MYSQL_PASSWORD`: Password for the MySQL database

- `PAGE_DEFAULT_LIMIT`: Default limit for pagination
- `PAGE_MAX_LIMIT`: Maximum limit for pagination

- `SMTP_HOST`: Host of the SMTP server
- `SMTP_PORT`: Port of the SMTP server
- `SMTP_USERNAME`: Username for the SMTP server
- `SMTP_PASSWORD`: Password for the SMTP server
- `SMTP_EMAIL_FROM`: Email address used as the "From" field in sent emails
- `SMTP_NAME_FROM`: Name used as the "From" field in sent emails

- `ADMIN_WALLET`: Wallet address of the admin

- `MYSQL_HOST_TEST`: Host of the MySQL database used for end-to-end tests
- `MYSQL_PORT_TEST`: Port of the MySQL database used for end-to-end tests
- `MYSQL_DATABASE_TEST`: Name of the MySQL database used for end-to-end tests
- `MYSQL_USER_TEST`: Username for the MySQL database used for end-to-end tests
- `MYSQL_PASSWORD_TEST`: Password for the MySQL database used for end-to-end tests

- `APILLON_KEY`: API key obtained from app.apillon.io
- `APILLON_SECRET`: API secret obtained from app.apillon.io
- `APILLON_API_URL`: URL of the Apillon API

- `COLLECTION_UUID`: UUID of the NFT collection from Apillon NFT Service
- `MAX_SUPPLY`: Maximum supply of the NFT collection
- `CLAIM_TYPE`: Type of claim for the NFT collections

- `CAPTCHA_SECRET`: Secret key for captcha verification
- `CLAIM_EXPIRES_IN`: Number of hours users have to claim NFT, before they are removed from line and become ineligible to claim
