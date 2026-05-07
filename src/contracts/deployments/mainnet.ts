import { Address } from 'viem';

export interface DeploymentInfo {
  contractName: string;
  address: Address;
  deployedAt: number; // block number
  txHash: string;
  chainId: number;
  version: string;
}

const mainnetDeployments: DeploymentInfo[] = [
  {
    contractName: 'EntryPoint',
    address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    deployedAt: 17_000_000,
    txHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
    chainId: 1,
    version: '0.7.0',
  },
  {
    contractName: 'SmartAccountFactory',
    address: '0x0000000000000000000000000000000000000000',
    deployedAt: 0,
    txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    chainId: 1,
    version: '1.0.0',
  },
];

export default mainnetDeployments;

export function getDeployment(
  contractName: string,
): DeploymentInfo | undefined {
  return mainnetDeployments.find((d) => d.contractName === contractName);
}
