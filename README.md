# OTC Market with FHEVM

This project implements a **confidential OTC (Over-The-Counter) market**, where both **transaction amounts** and **transaction IDs** are encrypted to ensure user privacy.

The OTC market facilitates exchanges securely using **Fully Homomorphic Encryption (FHE)** operations on data, thanks to **FHEVM** (Fully Homomorphic Encryption Virtual Machine). Sensitive data, such as transaction amounts and IDs, are encrypted to maintain the security and confidentiality of trades. This ensures that even market operators cannot access transaction details.

## Key Features

- **Encrypted Amounts**: All transaction amounts are encrypted before being recorded on the blockchain.
- **Encrypted Transaction IDs**: Transaction IDs are also encrypted, ensuring that no one, except legitimate participants, can identify specific transactions.
- **Data Confidentiality**: Users can interact with the market without revealing their financial information or transaction details to others.

## Prerequisites

Before interacting with the frontend interface of the project, please follow these steps:

1. **Install MetaMask**:
   The project uses MetaMask for account management and transactions. Make sure to install the MetaMask extension on your browser. You can download it from [here](https://metamask.io/).

## Folder Structure

The project is divided into two main folders:

- **`front_end`**: This folder contains the frontend of the project, developed using **Next.js**. It includes the user interface for interacting with the OTC market. Users will be able to connect their MetaMask wallet, view available transactions, and perform encrypted OTC trades through this interface.

- **`smart_contract`**: This folder contains the Solidity smart contracts for the OTC market. These contracts handle the creation of transactions, encryption of transaction amounts and IDs, and overall management of the OTC exchange on the blockchain.
