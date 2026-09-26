# AuthLens Frontend

**Live demo: https://authlens-app.vercel.app**

The web app for [AuthLens](https://github.com/zero-abd/AuthLens), built at HackTX 2025. AuthLens stores SHA-256 hashes of CCTV video on Ethereum so anyone can prove a clip hasn't been altered.

## What the live site does

No backend, no API keys, nothing stored on a server.

- **Verify.** Pick a video. Your browser computes its SHA-256 (Web Crypto), then calls `verifyHash` on the `VideoAuth` contract on Sepolia through a public RPC. If the hash is registered, the page shows who registered it, the block, the time and the transaction (read from the `HashStored` event). If not, the file was never registered or was edited after registration. You can also paste a hash directly.
- **Register.** If a video isn't on chain yet, connect MetaMask on Sepolia and call `storeHash` from your own wallet. You sign and pay the test-ETH gas yourself.

Contract: [`0xCdE932271cdFc5BECE4105A30598095C1ed2Dee7`](https://sepolia.etherscan.io/address/0xCdE932271cdFc5BECE4105A30598095C1ed2Dee7) on Sepolia (source in the main repo, `contracts/VideoAuth.sol`).

## Run locally

```bash
npm ci
npm start
```

That gives you the same keyless verifier as the live site. Optional settings in `.env.local`:

| Variable | Purpose |
|---|---|
| `REACT_APP_SEPOLIA_RPC` | Your own Sepolia RPC URL, tried before the public ones. |
| `REACT_APP_API_URL` | URL of the AuthLens FastAPI backend (e.g. `http://localhost:8000`). Turns on the Live monitor, Download and Ledger pages, which record camera footage in one-minute chunks and have the backend register each chunk's hash. See the main repo for backend setup. |

## Stack

Create React App + TypeScript, React Router, Framer Motion, ethers v6.
