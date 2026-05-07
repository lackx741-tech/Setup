import { createConfig, http } from 'wagmi';
import {
  mainnet,
  sepolia,
  base,
  arbitrum,
} from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'YOUR_PROJECT_ID';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, base, arbitrum],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({
      appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'EIP-7702 Dashboard',
    }),
  ],
  transports: {
    [mainnet.id]: http(
      process.env.NEXT_PUBLIC_MAINNET_RPC_URL ?? 'https://eth.llamarpc.com',
    ),
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
        'https://rpc.sepolia.org',
    ),
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC_URL ??
        'https://mainnet.base.org',
    ),
    [arbitrum.id]: http(
      process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ??
        'https://arb1.arbitrum.io/rpc',
    ),
  },
  ssr: true,
});

export type WagmiConfig = typeof wagmiConfig;
