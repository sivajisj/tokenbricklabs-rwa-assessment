

````md
## Blockchain Assessment — Sepolia LendingPool API

This assessment implementation adds a simple API endpoint that reads live data from a deployed LendingPool smart contract on Ethereum Sepolia using `ethers.js`.

### Implementation

- Network: Ethereum Sepolia
- Contract: LendingPool
- Contract Address: `0xc2a7809322bdce4d50e12ba05efdc967948b4870`
- Endpoint: `GET /api/SivajiApiTest`
- Contract method: `getUserPosition(address)`
- Data returned:
  - Collateral USD
  - Debt USD
  - Health Factor
  - Liquidation Status

### Setup

Install dependencies:

```bash
npm install
````

Create a local `.env` file:

```env
INFURA_PROJECT_ID=your-infura-project-id
```

Start the backend:

```bash
npm run dev:backend
```

The server runs on:

```text
http://localhost:3001
```

### Test the Assessment Endpoint

```bash
curl http://localhost:3001/api/SivajiApiTest
```

Example response:

```json
{
  "success": true,
  "network": "sepolia",
  "contract": "0xc2a7809322bdce4d50e12ba05efdc967948b4870",
  "user": "0x3F7032d3fD8aA2380a8cc7EE1b0Ed8AB7Eb6Fcd6",
  "position": {
    "collateralUsd": "108.5364",
    "debtUsd": "2.041353",
    "healthFactor": "42.535083349131678842",
    "liquidatable": false
  }
}
```

The endpoint also logs the fetched position to the backend console.

### Error Handling

Blockchain/RPC failures are handled with a `502` response while detailed errors are logged server-side.

```
