/**
 * Environment variable validation and access.
 * All env vars are validated at module load time in server contexts.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue;
}

// Public env vars (safe to use in browser)
export const env = {
  APP_NAME: optionalEnv('NEXT_PUBLIC_APP_NAME', 'EIP-7702 Dashboard'),
  APP_URL: optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  ENVIRONMENT: (optionalEnv('NEXT_PUBLIC_ENVIRONMENT', 'development') as
    | 'development'
    | 'staging'
    | 'production'),

  WALLETCONNECT_PROJECT_ID: optionalEnv(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    '',
  ),

  MAINNET_RPC_URL: optionalEnv(
    'NEXT_PUBLIC_MAINNET_RPC_URL',
    'https://eth.llamarpc.com',
  ),
  SEPOLIA_RPC_URL: optionalEnv(
    'NEXT_PUBLIC_SEPOLIA_RPC_URL',
    'https://rpc.sepolia.org',
  ),
  BASE_RPC_URL: optionalEnv(
    'NEXT_PUBLIC_BASE_RPC_URL',
    'https://mainnet.base.org',
  ),
  ARBITRUM_RPC_URL: optionalEnv(
    'NEXT_PUBLIC_ARBITRUM_RPC_URL',
    'https://arb1.arbitrum.io/rpc',
  ),

  BUNDLER_URL: optionalEnv('NEXT_PUBLIC_BUNDLER_URL', ''),
  PAYMASTER_URL: optionalEnv('NEXT_PUBLIC_PAYMASTER_URL', ''),
  PAYMASTER_POLICY_ID: optionalEnv('NEXT_PUBLIC_PAYMASTER_POLICY_ID', ''),
  RELAY_URL: optionalEnv('NEXT_PUBLIC_RELAY_URL', '/api/relay'),

  IS_DEVELOPMENT:
    optionalEnv('NEXT_PUBLIC_ENVIRONMENT', 'development') === 'development',
  IS_PRODUCTION:
    optionalEnv('NEXT_PUBLIC_ENVIRONMENT', 'development') === 'production',
} as const;

// Server-only env vars (never exposed to browser)
export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() must only be called on the server');
  }
  return {
    JWT_SECRET: requireEnv('JWT_SECRET'),
    JWT_EXPIRY: optionalEnv('JWT_EXPIRY', '24h'),
    RELAY_SECRET_KEY: optionalEnv('RELAY_SECRET_KEY', ''),
    RELAY_WEBHOOK_SECRET: optionalEnv('RELAY_WEBHOOK_SECRET', ''),
    BUNDLER_API_KEY: optionalEnv('BUNDLER_API_KEY', ''),
    PAYMASTER_API_KEY: optionalEnv('PAYMASTER_API_KEY', ''),
    DATABASE_URL: optionalEnv('DATABASE_URL', ''),
    ALCHEMY_API_KEY: optionalEnv('ALCHEMY_API_KEY', ''),
  };
}
