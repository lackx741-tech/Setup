#!/usr/bin/env ts-node
/**
 * Verify deployed contracts on Etherscan.
 * Usage: npx ts-node src/scripts/verify.ts --network sepolia --address 0x...
 */
import { sepolia, mainnet, base, arbitrum } from 'viem/chains';

const EXPLORERS: Record<string, { name: string; apiUrl: string; apiKeyEnv: string }> = {
  mainnet: { name: 'Etherscan', apiUrl: 'https://api.etherscan.io/api', apiKeyEnv: 'ETHERSCAN_API_KEY' },
  sepolia: { name: 'Etherscan (Sepolia)', apiUrl: 'https://api-sepolia.etherscan.io/api', apiKeyEnv: 'ETHERSCAN_API_KEY' },
  base: { name: 'Basescan', apiUrl: 'https://api.basescan.org/api', apiKeyEnv: 'BASESCAN_API_KEY' },
  arbitrum: { name: 'Arbiscan', apiUrl: 'https://api.arbiscan.io/api', apiKeyEnv: 'ARBISCAN_API_KEY' },
};

async function main() {
  const args = process.argv.slice(2);
  const networkArg = args.find((a) => a.startsWith('--network='))?.split('=')[1] ?? 'sepolia';
  const addressArg = args.find((a) => a.startsWith('--address='))?.split('=')[1];

  if (!addressArg) {
    console.error('Usage: verify.ts --network=<network> --address=<contract-address>');
    process.exit(1);
  }

  const explorer = EXPLORERS[networkArg];
  if (!explorer) {
    console.error(`No explorer configured for network: ${networkArg}`);
    process.exit(1);
  }

  const apiKey = process.env[explorer.apiKeyEnv];
  if (!apiKey) {
    console.error(`${explorer.apiKeyEnv} environment variable not set`);
    process.exit(1);
  }

  console.log(`\n🔍 Verifying ${addressArg} on ${explorer.name}`);

  // Fetch contract info
  const url = new URL(explorer.apiUrl);
  url.searchParams.set('module', 'contract');
  url.searchParams.set('action', 'getsourcecode');
  url.searchParams.set('address', addressArg);
  url.searchParams.set('apikey', apiKey);

  const res = await fetch(url.toString());
  const data = await res.json() as { status: string; result: { ContractName: string; ABI: string }[] };

  if (data.status === '1' && data.result[0]?.ABI !== 'Contract source code not verified') {
    console.log(`✅ Already verified: ${data.result[0]?.ContractName}`);
  } else {
    console.log('❌ Not verified. Submit verification via the explorer or hardhat-verify plugin.');
  }

  console.log(`\nExplorer: ${explorer.apiUrl.replace('/api', `/address/${addressArg}`)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
