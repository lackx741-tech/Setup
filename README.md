# Project Structure

Comprehensive architecture for a modern Next.js application integrating:

- **EIP-7702**
- **ERC-4337 Account Abstraction**
- **Relay Infrastructure**
- **Delegation-as-a-Service (DaaS)**
- **Gasless Transactions**
- **Smart Account Management**
- **Bundler + Paymaster Systems**

---

# Directory Overview

```bash
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── components/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── ActivityFeed.tsx
│   │       └── NetworkStatus.tsx
│   │
│   └── api/
│       └── relay/
│           ├── route.ts
│           ├── auth/
│           │   └── route.ts
│           ├── delegate/
│           │   └── route.ts
│           ├── execute/
│           │   └── route.ts
│           └── health/
│               └── route.ts
│
├── components/
│   ├── eip7702/
│   │   ├── DelegationForm.tsx
│   │   ├── AuthCallExecutor.tsx
│   │   ├── DelegationStatus.tsx
│   │   ├── Type4TransactionBuilder.tsx
│   │   └── DelegationHistory.tsx
│   │
│   ├── erc4337/
│   │   ├── UserOperationBuilder.tsx
│   │   ├── EntryPointStatus.tsx
│   │   ├── PaymasterSelector.tsx
│   │   ├── BundlerConsole.tsx
│   │   ├── SmartAccountFactory.tsx
│   │   └── SponsoredTransaction.tsx
│   │
│   └── toolkit/
│       ├── DaaSSweeper.tsx
│       ├── ETHSweeper.tsx
│       ├── TokenRecovery.tsx
│       ├── GasEstimator.tsx
│       ├── BatchTransfer.tsx
│       └── ExecutionConsole.tsx
│
├── contracts/
│   ├── abis/
│   │   ├── EntryPoint.json
│   │   ├── Paymaster.json
│   │   ├── SmartAccount.json
│   │   ├── DelegationManager.json
│   │   ├── DaaSExecutor.json
│   │   ├── ERC20.json
│   │   └── Orchestrator.json
│   │
│   ├── addresses.ts
│   ├── chains.ts
│   ├── constants.ts
│   └── deployments/
│       ├── mainnet.ts
│       ├── sepolia.ts
│       ├── base.ts
│       └── arbitrum.ts
│
├── hooks/
│   ├── useEIP7702.ts
│   ├── useERC4337.ts
│   ├── useDaaS.ts
│   ├── useBundler.ts
│   ├── usePaymaster.ts
│   ├── useSmartAccount.ts
│   ├── useGasless.ts
│   └── useRelay.ts
│
├── lib/
│   ├── wagmi.ts
│   ├── bundler.ts
│   ├── relay-sdk.ts
│   ├── viem.ts
│   ├── logger.ts
│   ├── env.ts
│   ├── auth.ts
│   ├── permissions.ts
│   └── utils/
│       ├── encoding.ts
│       ├── signatures.ts
│       ├── userop.ts
│       ├── delegation.ts
│       ├── calldata.ts
│       └── validation.ts
│
├── store/
│   ├── wallet.store.ts
│   ├── bundler.store.ts
│   ├── delegation.store.ts
│   └── execution.store.ts
│
├── types/
│   ├── eip7702.ts
│   ├── erc4337.ts
│   ├── relay.ts
│   ├── daas.ts
│   └── global.ts
│
├── styles/
│   ├── globals.css
│   ├── dashboard.css
│   └── themes/
│       ├── dark.css
│       └── light.css
│
├── config/
│   ├── app.config.ts
│   ├── chains.config.ts
│   ├── bundler.config.ts
│   └── paymaster.config.ts
│
├── tests/
│   ├── unit/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── relay/
│   │
│   ├── integration/
│   │   ├── eip7702.test.ts
│   │   ├── erc4337.test.ts
│   │   └── relay.test.ts
│   │
│   └── e2e/
│       ├── dashboard.spec.ts
│       └── delegation-flow.spec.ts
│
├── scripts/
│   ├── deploy.ts
│   ├── verify.ts
│   ├── seed.ts
│   └── generate-types.ts
│
├── public/
│   ├── icons/
│   └── images/
│
├── .env.local
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
```

---

# Core Modules

## `app/`

Contains the Next.js App Router pages, layouts, loading states, and API routes.

### Dashboard

Main application UI including:

- Header
- Sidebar
- Activity Feed
- Network Status

### API Routes

Relay infrastructure endpoints:

- Authentication
- Delegation execution
- Transaction relay
- Health monitoring

---

# EIP-7702 Components

Located in:

```bash
components/eip7702/
```

### Features

- Delegation creation
- Delegation history tracking
- Type-4 transaction builder
- Authorized call execution
- Delegation state monitoring

---

# ERC-4337 Components

Located in:

```bash
components/erc4337/
```

### Features

- UserOperation builder
- Bundler integration
- EntryPoint monitoring
- Paymaster support
- Smart account factory
- Sponsored transactions

---

# Toolkit Components

Utility interfaces for advanced operations.

### Includes

- ETH sweeping
- DaaS sweeping
- Token recovery
- Gas estimation
- Batch transfer execution
- Execution console

---

# Smart Contract Layer

Located in:

```bash
contracts/
```

### Includes

- ABIs
- Chain deployments
- Network constants
- Address registries

### Supported Networks

- Ethereum Mainnet
- Sepolia
- Base
- Arbitrum

---

# Custom Hooks

Located in:

```bash
hooks/
```

### Available Hooks

| Hook | Purpose |
|------|----------|
| `useEIP7702` | EIP-7702 interactions |
| `useERC4337` | Account abstraction logic |
| `useDaaS` | Delegation-as-a-Service |
| `useBundler` | Bundler communication |
| `usePaymaster` | Gas sponsorship |
| `useSmartAccount` | Smart account management |
| `useGasless` | Gasless transaction flows |
| `useRelay` | Relay infrastructure |

---

# Shared Libraries

Located in:

```bash
lib/
```

### Responsibilities

- Wagmi setup
- Viem utilities
- Relay SDK integration
- Bundler communication
- Authentication
- Permissions
- Logging

### Utility Modules

- Encoding
- Signature generation
- UserOperation builders
- Delegation helpers
- Calldata builders
- Validation utilities

---

# State Management

Located in:

```bash
store/
```

### Stores

- Wallet state
- Bundler state
- Delegation state
- Execution state

---

# Type Definitions

Located in:

```bash
types/
```

Contains shared TypeScript types for:

- EIP-7702
- ERC-4337
- Relay systems
- DaaS architecture
- Global application types

---

# Styling System

Located in:

```bash
styles/
```

### Includes

- Global styles
- Dashboard styles
- Dark theme
- Light theme

---

# Configuration Layer

Located in:

```bash
config/
```

### Configurations

- Application settings
- Chain configurations
- Bundler settings
- Paymaster settings

---

# Testing Strategy

Located in:

```bash
tests/
```

## Unit Tests

- Hooks
- Utilities
- Relay logic

## Integration Tests

- EIP-7702 flows
- ERC-4337 flows
- Relay systems

## End-to-End Tests

- Dashboard interactions
- Delegation workflows

---

# Scripts

Located in:

```bash
scripts/
```

### Automation

- Deployment
- Contract verification
- Database seeding
- Type generation

---

# Public Assets

Located in:

```bash
public/
```

### Assets

- Icons
- Images

---

# Root Configuration Files

| File | Purpose |
|------|----------|
| `.env.local` | Environment variables |
| `next.config.js` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.ts` | TailwindCSS setup |
| `postcss.config.js` | PostCSS configuration |
| `package.json` | Dependencies and scripts |

---

# Architecture Summary

This architecture is designed for:

- Modular scalability
- Smart account abstraction
- Gasless transaction systems
- Delegation infrastructure
- Multi-chain deployment
- Secure relay execution
- Enterprise-grade frontend architecture

It combines:

- **Next.js App Router**
- **TypeScript**
- **ERC-4337**
- **EIP-7702**
- **Wagmi**
- **Viem**
- **Relay Infrastructure**
- **Bundler + Paymaster Systems**

into a production-ready Web3 platform.
