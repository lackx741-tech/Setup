import { type AppConfig } from '@/types/global';
import { CHAIN_IDS } from '@/contracts/chains';

export const appConfig: AppConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'EIP-7702 / ERC-4337 Dashboard',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  environment: (process.env.NEXT_PUBLIC_ENVIRONMENT as AppConfig['environment']) ?? 'development',
  defaultChainId: CHAIN_IDS.SEPOLIA,
  features: {
    enableEIP7702: true,
    enableERC4337: true,
    enableDaaS: true,
    enableGasless: true,
    enableTestnets: true,
  },
};

export default appConfig;
