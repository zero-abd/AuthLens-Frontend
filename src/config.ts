// The FastAPI backend (live camera capture, recording, download, server ledger) runs locally.
// Set REACT_APP_API_URL=http://localhost:8000 in .env.local to enable those pages.
// Without it, the site is the keyless on-chain verifier only.
export const BACKEND_URL = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
export const HAS_BACKEND = BACKEND_URL !== "";
