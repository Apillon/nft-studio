This project is designed for Apillon's Simplets, which are pre-built, customizable, and open-source solutions for various NFT use cases. Here's a detailed explanation of how this project fits into Apillon's Simplets and the types of Simplets it supports:

## Apillon Simplets Overview

Apillon's Simplets are ready-to-use solutions that integrate multiple Web3 services into a plug-and-play setup. They are designed to simplify the deployment and management of NFT-related projects.

The full list of simplets can be found [on this link](https://app.apillon.io/dashboard/solution)

## Types of Simplets Supported

1. **NFT Brand Booster**
   - **Purpose**: Send NFTs via email or claim viawallet.
   - **Features**: Build a whitelist, reward loyal users, grow email lists in exchange for rewards, or hand-pick recipients for NFT drops.

2. **NFT Event Experience**
   - **Purpose**: Create digital badges for event attendees.
   - **Features**: Drop NFTs on-site or online, allowing attendees to collect proof of attendance.

3. **NFT Wild West**
   - **Purpose**: First-come-first-served NFTs.
   - **Features**: Run bold, experimental campaigns using memes, mystery, or chaos to go viral and reward the fastest participants.

## Project Structure and Tech Stack

The project consists of two main components:

1. **Node.js Backend APIs**
   - **Functionality**: Handles NFT distribution, email notifications, and tracking of NFT deliveries.
   - **Deployment**: Can be run locally or via Docker. Configuration files need to be set up with collectible and email server details.

2. **Vue 3 Frontend**
   - **Functionality**: Provides an admin panel for managing email addresses, tracking NFT deliveries, and automating email notifications.
   - **Deployment**: Can be hosted locally or on any website provider. Apillon's hosting service is also available, with GitHub actions setup for deployment.

## Getting Started

- **Basic Users**: Download the ZIP file from the repository, set up the configuration, and run the application.
- **Advanced Users**: Fork the repository, configure and modify the APIs and website, and deploy using Docker or Apillon hosting.

### Prerequisites

- Apillon API key and secret for SDK usage (can be generated on app.apillon.io)
- An NFT collection created using Apillon (can be created on app.apillon.io)
- Access to an email server (cloud SMTP server, for example AWS SES or resend.com)
- Access to MySQL Database (local or cloud)
- A specialized Ethereum wallet for admin access

### Documentation

| Resource                       | Description              |
| ------------------------------ | ------------------------ |
| [Backend](backend/README.md)   | Docs for Node.js backend |
| [Frontend](frontend/README.md) | Docs from Vue 3 frontend |

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.
