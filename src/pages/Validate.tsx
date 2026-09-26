import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  ShieldCheck,
  XCircle,
  Clock,
  FileVideo,
  RefreshCw,
  Wallet,
  Hash,
  ExternalLink,
} from "lucide-react";
import {
  CONTRACT_ADDRESS,
  ETHERSCAN,
  OnChainStatus,
  Registration,
  connectWallet,
  findRegistration,
  hasWallet,
  isHash,
  registerHash,
  sha256File,
  verifyHash,
  walletErrorMessage,
} from "../lib/chain";
import "./Validate.css";

// A one-minute CCTV chunk registered by the AuthLens backend during HackTX 2025.
const EXAMPLE_HASH = "0xce734ec3b380e86fbbc194b1b9c7403164ec1593fe049327df59544d95ab30c0";

type Phase = "idle" | "hashing" | "checking" | "done";
type RegPhase = "idle" | "connecting" | "ready" | "signing" | "mining" | "done";

const short = (s: string, n = 6) => `${s.slice(0, n + 2)}…${s.slice(-n)}`;

export const Validate: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");
  const [hashInput, setHashInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<OnChainStatus | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [scan, setScan] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [account, setAccount] = useState("");
  const [regPhase, setRegPhase] = useState<RegPhase>("idle");
  const [pendingTx, setPendingTx] = useState("");
  const [regError, setRegError] = useState("");

  const runId = useRef(0);

  const check = async (h: string) => {
    const run = ++runId.current;
    setPhase("checking");
    setStatus(null);
    setRegistration(null);
    setScan(null);
    setError("");
    try {
      const s = await verifyHash(h);
      if (run !== runId.current) return;
      setStatus(s);
      setPhase("done");
      if (s.exists) {
        setScan(0);
        const r = await findRegistration(h, (f) => run === runId.current && setScan(f));
        if (run !== runId.current) return;
        setRegistration(r);
        setScan(null);
      }
    } catch (e: any) {
      if (run !== runId.current) return;
      setPhase("done");
      setScan(null);
      setError(`Could not read the Sepolia contract: ${e?.shortMessage || e?.message || e}`);
    }
  };

  const onSelect = async (selected: File) => {
    const run = ++runId.current;
    setFile(selected);
    setHash("");
    setStatus(null);
    setRegistration(null);
    setError("");
    setRegPhase(account ? "ready" : "idle");
    setRegError("");
    setPendingTx("");
    setPhase("hashing");
    try {
      const h = await sha256File(selected);
      if (run !== runId.current) return;
      setHash(h);
      await check(h);
    } catch (e: any) {
      setPhase("done");
      setError(`Could not hash the file: ${e?.message || e}`);
    }
  };

  const onLookup = (raw: string) => {
    const h = raw.trim().toLowerCase();
    if (!isHash(h)) {
      setError("A video hash is 0x followed by 64 hex characters.");
      return;
    }
    setFile(null);
    setHash(h);
    setRegError("");
    setPendingTx("");
    check(h);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onSelect(dropped);
  };

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const picked = e.target.files?.[0];
    if (picked) onSelect(picked);
    e.target.value = "";
  };

  const reset = () => {
    runId.current++;
    setFile(null);
    setHash("");
    setHashInput("");
    setPhase("idle");
    setStatus(null);
    setRegistration(null);
    setScan(null);
    setError("");
    setRegError("");
    setPendingTx("");
    setRegPhase(account ? "ready" : "idle");
  };

  const onConnect = async () => {
    setRegError("");
    setRegPhase("connecting");
    try {
      setAccount(await connectWallet());
      setRegPhase("ready");
    } catch (e) {
      setRegError(walletErrorMessage(e));
      setRegPhase("idle");
    }
  };

  const onRegister = async () => {
    setRegError("");
    setRegPhase("signing");
    try {
      const fresh = await verifyHash(hash);
      if (fresh.exists) {
        setRegPhase("ready");
        await check(hash);
        return;
      }
      await registerHash(hash, (tx) => {
        setPendingTx(tx);
        setRegPhase("mining");
      });
      setRegPhase("done");
      await check(hash);
    } catch (e) {
      setRegError(walletErrorMessage(e));
      setRegPhase("ready");
    }
  };

  const verdict = phase !== "done" || !status ? null : status.exists ? "registered" : "missing";

  return (
    <div className="validate-page">
      <motion.div className="header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2>
          <FileVideo className="title-icon" /> Verify a video
        </h2>
        <p className="tagline">
          Your browser computes the file's SHA-256 and checks it against the AuthLens contract on
          Ethereum Sepolia. The video never leaves your device.
        </p>
      </motion.div>

      <div className="grid">
        <motion.div className="card uploader" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
            <UploadCloud className="dz-icon" />
            <p>Drag and drop a video here or</p>
            <label className="btn">
              Choose file
              <input type="file" accept="video/*" onChange={onPick} hidden />
            </label>
            {file && <span className="file-name">{file.name}</span>}
          </div>

          <form
            className="hash-lookup"
            onSubmit={(e) => {
              e.preventDefault();
              onLookup(hashInput);
            }}
          >
            <label htmlFor="hash-input">
              <Hash size={14} /> Or look up a hash
            </label>
            <div className="hash-row">
              <input
                id="hash-input"
                placeholder="0x…"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                spellCheck={false}
              />
              <button type="submit" className="btn">
                Check
              </button>
            </div>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setHashInput(EXAMPLE_HASH);
                onLookup(EXAMPLE_HASH);
              }}
            >
              Try a clip hash registered at HackTX 2025
            </button>
          </form>

          {phase === "done" && (
            <button className="btn-reset" onClick={reset}>
              <RefreshCw /> Verify another
            </button>
          )}
        </motion.div>

        <motion.div className="card result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {phase === "idle" && !error && <p className="muted">No file selected.</p>}

          {(phase === "hashing" || phase === "checking") && (
            <div className="verdict-section">
              <div className="verdict-badge">
                <Clock className="v-icon" />
                <span>{phase === "hashing" ? "Hashing in your browser…" : "Reading the contract…"}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="error-box">
              <XCircle className="error-icon" />
              <p>{error}</p>
            </div>
          )}

          {verdict && (
            <div className="verdict-section">
              <div className={`verdict-badge ${verdict === "registered" ? "validated" : "not_validated"}`}>
                {verdict === "registered" ? <ShieldCheck className="v-icon" /> : <XCircle className="v-icon" />}
                <span>{verdict === "registered" ? "Registered on chain" : "Not found"}</span>
              </div>
              <p className="verdict-message">
                {verdict === "registered"
                  ? file
                    ? "This exact file was registered on Ethereum Sepolia. Not a single byte has changed since."
                    : "This hash was registered on Ethereum Sepolia."
                  : file
                  ? "No record of this exact file. It was never registered, or it was edited after registration: changing even one byte gives a different hash."
                  : "No record of this hash on the contract."}
              </p>

              <dl className="facts">
                <dt>SHA-256</dt>
                <dd>
                  <code>{hash}</code>
                </dd>
                {status?.owner && (
                  <>
                    <dt>Registered by</dt>
                    <dd>
                      <a href={`${ETHERSCAN}/address/${status.owner}`} target="_blank" rel="noreferrer">
                        <code>{short(status.owner)}</code> <ExternalLink size={12} />
                      </a>
                    </dd>
                    <dt>Registered at</dt>
                    <dd>
                      {registration
                        ? registration.timestamp.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })
                        : scan !== null
                        ? `Searching contract events… ${Math.round(scan * 100)}%`
                        : "Event not found"}
                    </dd>
                    {registration && (
                      <>
                        <dt>Block</dt>
                        <dd>
                          <a href={`${ETHERSCAN}/block/${registration.blockNumber}`} target="_blank" rel="noreferrer">
                            {registration.blockNumber.toLocaleString()} <ExternalLink size={12} />
                          </a>
                        </dd>
                        <dt>Transaction</dt>
                        <dd>
                          <a href={`${ETHERSCAN}/tx/${registration.txHash}`} target="_blank" rel="noreferrer">
                            <code>{short(registration.txHash)}</code> <ExternalLink size={12} />
                          </a>
                        </dd>
                      </>
                    )}
                  </>
                )}
              </dl>

              {verdict === "missing" && file && (
                <div className="register-box">
                  <h4>
                    <Wallet size={16} /> Register this video
                  </h4>
                  <p className="muted small">
                    Anchor this file's hash on Sepolia from your own wallet. You sign and pay test ETH
                    yourself; this site has no keys and no server.
                  </p>
                  {!hasWallet() ? (
                    <p className="muted small">
                      No browser wallet detected.{" "}
                      <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                        Install MetaMask
                      </a>{" "}
                      and get free Sepolia ETH from a faucet to register.
                    </p>
                  ) : !account ? (
                    <button className="btn" onClick={onConnect} disabled={regPhase === "connecting"}>
                      {regPhase === "connecting" ? "Connecting…" : "Connect wallet"}
                    </button>
                  ) : (
                    <>
                      <p className="muted small">
                        Connected: <code>{short(account)}</code> on Sepolia
                      </p>
                      <button
                        className="btn"
                        onClick={onRegister}
                        disabled={regPhase === "signing" || regPhase === "mining"}
                      >
                        {regPhase === "signing"
                          ? "Confirm in your wallet…"
                          : regPhase === "mining"
                          ? "Waiting for the block…"
                          : "Register hash"}
                      </button>
                    </>
                  )}
                  {pendingTx && (
                    <p className="muted small">
                      Transaction:{" "}
                      <a href={`${ETHERSCAN}/tx/${pendingTx}`} target="_blank" rel="noreferrer">
                        {short(pendingTx)}
                      </a>
                    </p>
                  )}
                  {regError && <p className="reg-error">{regError}</p>}
                </div>
              )}
            </div>
          )}

          <p className="contract-note">
            Contract{" "}
            <a href={`${ETHERSCAN}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
              {short(CONTRACT_ADDRESS)}
            </a>{" "}
            on Sepolia, read through a public RPC.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Validate;
