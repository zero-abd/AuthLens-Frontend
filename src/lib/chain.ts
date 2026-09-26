import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  getAddress,
  id as eventTopic,
} from "ethers";

// VideoAuth.sol, deployed with Hardhat Ignition (zero-abd/AuthLens,
// ignition/deployments/chain-11155111).
export const CONTRACT_ADDRESS = "0xCdE932271cdFc5BECE4105A30598095C1ed2Dee7";
export const DEPLOY_BLOCK = 9442869;
export const SEPOLIA_CHAIN_ID = 11155111;
export const ETHERSCAN = "https://sepolia.etherscan.io";

const ABI = [
  "function storeHash(bytes32 _videoHash)",
  "function verifyHash(bytes32 _videoHash) view returns (bool, address)",
  "event HashStored(address indexed uploader, bytes32 indexed videoHash)",
];
const HASH_STORED = eventTopic("HashStored(address,bytes32)");

// Public, keyless Sepolia endpoints. Reads only; nothing is ever signed here.
const RPC_URLS = [
  process.env.REACT_APP_SEPOLIA_RPC,
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://1rpc.io/sepolia",
].filter((u): u is string => !!u);

// publicnode caps eth_getLogs at 50,000 blocks per call.
const LOG_WINDOW = 50_000;
const LOG_CONCURRENCY = 6;

const providers = new Map<string, JsonRpcProvider>();
const readProvider = (url: string) => {
  let p = providers.get(url);
  if (!p) {
    p = new JsonRpcProvider(url, SEPOLIA_CHAIN_ID, { staticNetwork: true });
    providers.set(url, p);
  }
  return p;
};

async function withRpc<T>(fn: (p: JsonRpcProvider) => Promise<T>): Promise<T> {
  let last: unknown;
  for (const url of RPC_URLS) {
    try {
      return await fn(readProvider(url));
    } catch (e) {
      last = e;
    }
  }
  throw last instanceof Error ? last : new Error("All Sepolia RPC endpoints failed");
}

/** SHA-256 of the file's raw bytes, as 0x-prefixed hex. Same as the backend's hashlib.sha256. */
export async function sha256File(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return (
    "0x" +
    Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

export const isHash = (s: string) => /^0x[0-9a-fA-F]{64}$/.test(s.trim());

export interface OnChainStatus {
  exists: boolean;
  owner: string | null;
}

export async function verifyHash(hash: string): Promise<OnChainStatus> {
  const [exists, owner] = await withRpc((p) =>
    new Contract(CONTRACT_ADDRESS, ABI, p).verifyHash(hash)
  );
  return { exists, owner: exists ? getAddress(owner) : null };
}

export interface Registration {
  blockNumber: number;
  txHash: string;
  timestamp: Date;
}

/**
 * The contract keeps no timestamp, so read it from the HashStored event's block.
 * Scans backwards from the chain head in 50k-block windows and stops at the first hit.
 */
export async function findRegistration(
  hash: string,
  onProgress?: (fraction: number) => void
): Promise<Registration | null> {
  const head = await withRpc((p) => p.getBlockNumber());
  const windows: [number, number][] = [];
  for (let to = head; to >= DEPLOY_BLOCK; to -= LOG_WINDOW) {
    windows.push([Math.max(DEPLOY_BLOCK, to - LOG_WINDOW + 1), to]);
  }
  let done = 0;
  for (let i = 0; i < windows.length; i += LOG_CONCURRENCY) {
    const batch = windows.slice(i, i + LOG_CONCURRENCY);
    const results = await Promise.all(
      batch.map(([fromBlock, toBlock]) =>
        withRpc((p) =>
          p.getLogs({
            address: CONTRACT_ADDRESS,
            topics: [HASH_STORED, null, hash.toLowerCase()],
            fromBlock,
            toBlock,
          })
        )
      )
    );
    done += batch.length;
    onProgress?.(done / windows.length);
    const log = results.flat()[0];
    if (log) {
      const block = await withRpc((p) => p.getBlock(log.blockNumber));
      return {
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        timestamp: new Date(Number(block?.timestamp ?? 0) * 1000),
      };
    }
  }
  return null;
}

// ---- Writing: the visitor's own wallet signs and pays; no key ever touches this site. ----

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};
const injected = (): Eip1193 | undefined => (window as any).ethereum;

export const hasWallet = () => !!injected();

async function ensureSepolia(eth: Eip1193) {
  const hex = "0x" + SEPOLIA_CHAIN_ID.toString(16);
  if ((await eth.request({ method: "eth_chainId" })) === hex) return;
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex }] });
  } catch (e: any) {
    if (e?.code !== 4902) throw e;
    await eth.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: hex,
          chainName: "Sepolia",
          nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
          blockExplorerUrls: [ETHERSCAN],
        },
      ],
    });
  }
}

export async function connectWallet(): Promise<string> {
  const eth = injected();
  if (!eth) throw new Error("No browser wallet found. Install MetaMask to register videos.");
  await eth.request({ method: "eth_requestAccounts" });
  await ensureSepolia(eth);
  const signer = await new BrowserProvider(eth as any).getSigner();
  return getAddress(await signer.getAddress());
}

/** Sends storeHash from the visitor's wallet. Resolves with the tx hash once mined. */
export async function registerHash(
  hash: string,
  onSent?: (txHash: string) => void
): Promise<{ txHash: string; blockNumber: number }> {
  const eth = injected();
  if (!eth) throw new Error("No browser wallet found. Install MetaMask to register videos.");
  await ensureSepolia(eth);
  const signer = await new BrowserProvider(eth as any).getSigner();
  const tx = await new Contract(CONTRACT_ADDRESS, ABI, signer).storeHash(hash);
  onSent?.(tx.hash);
  const receipt = await tx.wait();
  if (!receipt || receipt.status !== 1) throw new Error("Transaction failed on chain.");
  return { txHash: tx.hash, blockNumber: receipt.blockNumber };
}

export function walletErrorMessage(e: any): string {
  if (e?.code === "ACTION_REJECTED" || e?.code === 4001) return "You rejected the request in your wallet.";
  if (e?.code === "INSUFFICIENT_FUNDS")
    return "Your wallet has no Sepolia ETH for gas. Get some free test ETH from a Sepolia faucet and try again.";
  const reason = e?.reason || e?.shortMessage || e?.message;
  return reason ? String(reason) : "Something went wrong.";
}
