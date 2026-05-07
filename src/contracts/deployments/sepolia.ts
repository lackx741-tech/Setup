import { Address } from 'viem';

export interface DeploymentInfo {
  contractName: string;
  address: Address;
  deployedAt: number;
  txHash: string;
  chainId: number;
  version: string;
}

const sepoliaDeployments: DeploymentInfo[] = [
  {
    contractName: 'EntryPoint',
    address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    deployedAt: 4_000_000,
    txHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
    chainId: 11155111,
    version: '0.6.0',
  },
  {
    contractName: 'SmartAccountFactory',
    address: '0x0000000000000000000000000000000000000002',
    deployedAt: 4_100_000,
    txHash: '0x0000000000000000000000000000000000000000000000000000000000000002',
    chainId: 11155111,
    version: '1.0.0',
  },
  {
    contractName: 'DelegationManager',
    address: '0x0000000000000000000000000000000000000003',
    deployedAt: 4_200_000,
    txHash: '0x0000000000000000000000000000000000000000000000000000000000000003',
    chainId: 11155111,
    version: '1.0.0',
  },
  {
    contractName: 'DaaSExecutor',
    address: '0x0000000000000000000000000000000000000004',
    deployedAt: 4_300_000,
    txHash: '0x0000000000000000000000000000000000000000000000000000000000000004',
    chainId: 11155111,
    version: '1.0.0',
  },
];

export default sepoliaDeployments;

export function getDeployment(contractName: string): DeploymentInfo | undefined {
  return sepoliaDeployments.find((d) => d.contractName === contractName);
}
