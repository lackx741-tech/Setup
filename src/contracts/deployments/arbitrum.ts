import { Address } from 'viem';

export interface DeploymentInfo {
  contractName: string;
  address: Address;
  deployedAt: number;
  txHash: string;
  chainId: number;
  version: string;
}

const arbitrumDeployments: DeploymentInfo[] = [
  {
    contractName: 'EntryPoint',
    address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    deployedAt: 150_000_000,
    txHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
    chainId: 42161,
    version: '0.6.0',
  },
  {
    contractName: 'SmartAccountFactory',
    address: '0x0000000000000000000000000000000000000000',
    deployedAt: 0,
    txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    chainId: 42161,
    version: '1.0.0',
  },
];

export default arbitrumDeployments;

export function getDeployment(contractName: string): DeploymentInfo | undefined {
  return arbitrumDeployments.find((d) => d.contractName === contractName);
}
