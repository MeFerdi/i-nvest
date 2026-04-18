# WeSignl

WeSignl is a non-custodial Solana wallet intelligence application that monitors wallet activity, surfaces actionable signals, and prepares user-approved execution flows.

## Features

- Solflare wallet connection
- wallet monitoring for balances, token positions, and recent transactions
- signal detection for idle funds, price movement, and large inflows
- action suggestions for Kamino deposits and SOL/USDC routing
- execution confirmation flows with wallet approval
- backend scaffold for signal persistence, wallet tracking, and execution intents

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- Solana Wallet Adapter
- `@solana/web3.js`

### Backend Scaffold

- Node.js
- Fastify-style route structure
- Zod
- Postgres schema

### Integrations

- Solflare
- Solana RPC / QuickNode
- Jupiter
- DFlow
- Kamino

## Project Structure

```text
i-nvest/
├── backend/                  # backend scaffold, routes, schema, architecture
├── src/
│   ├── assets/               # local brand and product assets
│   ├── components/           # UI components
│   ├── hooks/                # wallet monitor and signal logic
│   ├── services/             # Solana, pricing, Kamino, and DFlow integrations
│   └── config.js             # frontend runtime configuration
├── brand.md                  # visual system reference
├── content-principles.md     # UI writing and content rules
├── package.json              # frontend scripts and dependencies
└── README.md
```

## Frontend Setup

### Requirements

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Backend Setup

The backend is scaffolded but not fully integrated yet.

### Install

```bash
cd backend
npm install
```

### Configure

```bash
cp .env.example .env
```

### Run

```bash
npm run dev
```

### Syntax Check

```bash
npm run check
```

## Architecture Notes

The current frontend still handles some responsibilities that should move to the backend over time:

- wallet polling
- transaction history fetching
- signal generation
- execution preparation

The backend scaffold is intended to support:

- wallet-authenticated sessions
- tracked wallet state
- persisted signals
- execution intents
- backend-assisted monitoring and orchestration

See:

- [backend/README.md](./backend/README.md)
- [backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md)
- [backend/db/schema.sql](./backend/db/schema.sql)

## Design References

- [brand.md](./brand.md)
- [content-principles.md](./content-principles.md)

## Status

Implemented:

- branded frontend
- wallet connect and dashboard flow
- client-side monitoring and signal generation
- action execution hooks for Kamino and DFlow/Jupiter
- backend scaffold with route and schema foundation

Planned next:

- move signal generation to the backend
- persist user settings through backend APIs
- move wallet monitoring into backend jobs
- prepare execution intents server-side
