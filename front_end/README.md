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

2. **Connect MetaMask to a compatible Ethereum network**:
   The project works with a compatible Ethereum network. Ensure that MetaMask is connected to this network before starting to interact with the OTC market.

## Running the Frontend

To run the OTC Market frontend, follow these steps:

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://your-repository-url.git
cd otc-market
```

### 2. Install dependencies

Execute this command to install all dependencies
```bash
npm i
```

### 3. Execute Next.js

Execute this command to install start front server side
```bash
npm run dev
```

### 3. Open navigator

Open navigator like google or firefox

```bash
https://localhost:3000
```

