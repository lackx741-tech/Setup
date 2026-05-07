#!/usr/bin/env ts-node
/**
 * Seed the database / local state with test data.
 * Usage: npx ts-node src/scripts/seed.ts --network sepolia
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { type Address } from 'viem';

interface SeedData {
  delegations: {
    id: string;
    authority: Address;
    delegate: Address;
    chainId: number;
    nonce: string;
    status: 'active' | 'revoked';
    createdAt: string;
  }[];
  sweepTargets: {
    address: Address;
    label: string;
    chainId: number;
  }[];
}

const SEED_DATA: SeedData = {
  delegations: [
    {
      id: 'seed-delegation-1',
      authority: '0x1234567890abcdef1234567890abcdef12345678',
      delegate: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      chainId: 11155111,
      nonce: '0',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seed-delegation-2',
      authority: '0x2234567890abcdef1234567890abcdef12345679',
      delegate: '0xabcdefabcdefabcdefabcdefabcdefabcdefabce',
      chainId: 11155111,
      nonce: '1',
      status: 'revoked',
      createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    },
  ],
  sweepTargets: [
    { address: '0x3334567890abcdef1234567890abcdef12345670', label: 'Test Account A', chainId: 11155111 },
    { address: '0x4434567890abcdef1234567890abcdef12345671', label: 'Test Account B', chainId: 11155111 },
  ],
};

async function main() {
  const args = process.argv.slice(2);
  const outputArg = args.find((a) => a.startsWith('--output='))?.split('=')[1] ?? 'seed-data.json';

  console.log('\n🌱 Seeding test data...');
  console.log(`   Delegations: ${SEED_DATA.delegations.length}`);
  console.log(`   Sweep targets: ${SEED_DATA.sweepTargets.length}`);

  const outputPath = join(process.cwd(), outputArg);
  writeFileSync(outputPath, JSON.stringify(SEED_DATA, null, 2));

  console.log(`\n✅ Seed data written to: ${outputPath}`);
  console.log('\nTo use this data, import it into your local storage or database.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
