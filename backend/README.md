# WeSignl Backend

This backend exists to move monitoring, signal generation, and execution preparation out of the browser.

## What this service is responsible for

- wallet-authenticated sessions
- tracked wallet state
- signal generation and persistence
- execution intent preparation
- provider orchestration for Solana, Jupiter, DFlow, and Kamino
- background monitoring jobs

## Why it exists

The frontend currently polls wallet state and computes signals client-side. That is acceptable for a prototype, but not for a serious product. The backend becomes the source of truth for:

- wallet snapshots
- recent transactions
- signal history
- dismissals
- execution tracking

## Initial route surface

- `GET /health`
- `POST /auth/challenge`
- `POST /auth/verify`
- `GET /wallets/:address/overview`
- `GET /wallets/:address/signals`
- `POST /wallets/:address/settings`
- `POST /signals/:signalId/prepare-execution`
- `POST /executions/:executionId/confirm`
- `GET /executions/:executionId/status`

## Next backend milestones

1. Replace client-side `useSignalEngine` with persisted backend signals
2. Replace browser polling with indexed wallet snapshots
3. Return unsigned transaction payloads for wallet approval
4. Add background workers for wallet refresh, prices, and execution status

## Run locally

1. Create a `.env` file in `backend/` if your local setup requires environment variables
2. Install dependencies in `backend/`
3. Run `npm run dev`
