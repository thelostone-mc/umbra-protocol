import { ethers } from 'ethers';
import { TransactionReceipt, JsonRpcSigner, Web3Provider } from 'src/utils/ethers';
import type { TokenList, TokenInfo } from '@uniswap/token-lists/dist/types';
import { UmbraLogger } from 'components/logger';
import { ETH_NETWORK_LOGO } from 'src/utils/constants';

export type { TokenList, TokenInfo } from '@uniswap/token-lists/dist/types';
export { BigNumber, Network, TransactionResponse } from 'src/utils/ethers';
export type Signer = JsonRpcSigner;
export type Provider = Web3Provider;

export interface MulticallResponse {
  blockNumber: ethers.BigNumber;
  returnData: string[];
}

// Spec: https://eips.ethereum.org/EIPS/eip-3085#specification
export type Chain = {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    // The address and logoURI fields are not part of the EIP-3085 spec but are added to make this field
    // compatible with type TokenInfo
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    name: string;
    symbol: string;
    decimals: 18;
    logoURI: string;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
  // logoURI is not part of EIP-3085, but is added for convenience because that is what our BaseSelect component
  // uses to display images form the chain objects it recevies. It's not required because we always want a chain
  // logo to be showin in the network selector dropdown
  logoURI: string;
};

export const supportedChains: Array<Chain> = [
  {
    chainId: '0x1',
    chainName: 'Mainnet',
    nativeCurrency: {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      logoURI: ETH_NETWORK_LOGO,
    },
    rpcUrls: [`https://mainnet.infura.io/v3/${String(process.env.INFURA_ID)}`],
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrls: [ETH_NETWORK_LOGO],
    logoURI: ETH_NETWORK_LOGO,
  },
  {
    chainId: '0x4',
    chainName: 'Rinkeby',
    nativeCurrency: {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      logoURI: ETH_NETWORK_LOGO,
    },
    rpcUrls: [`https://rinkeby.infura.io/v3/${String(process.env.INFURA_ID)}`],
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
    iconUrls: [ETH_NETWORK_LOGO],
    logoURI: ETH_NETWORK_LOGO,
  },
  {
    chainId: '0x89', // 137 as hex
    chainName: 'Polygon',
    nativeCurrency: {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
      logoURI: '/tokens/polygon.png',
    },
    rpcUrls: ['https://polygon-rpc.com/', `https://polygon-mainnet.infura.io/v3/${String(process.env.INFURA_ID)}`],
    blockExplorerUrls: ['https://polygonscan.com'],
    iconUrls: ['/networks/polygon.svg'],
    logoURI: '/networks/polygon.svg',
  },
];
// Set comprised of intersection of Chain IDs present for all contracts in src/contracts, supported by umbra-js, and by relayer
export type SupportedChainIds = '1' | '4' | '137'; // strings for indexing into JSON files
export const supportedChainIds = supportedChains.map((chain) => Number(chain.chainId)); // numbers for verifying the chainId user is connected to

// CNS names owned by wallet are queried from The Graph, so these types help parse the response
type CnsName = { name: string };
export interface CnsQueryResponse {
  data: {
    domains: CnsName[];
  };
}

// Relayer types
export type ApiError = { error: string };
export type TokenListResponse = TokenList | ApiError;
export type FeeEstimate = { fee: string; token: TokenInfo };
export type FeeEstimateResponse = FeeEstimate | ApiError;
export type WithdrawalInputs = {
  stealthAddr: string;
  acceptor: string;
  signature: string;
  sponsorFee: string;
};
export type RelayResponse = { relayTransactionHash: string } | ApiError;
export type ITXStatusResponse = { receivedTime: string; broadcasts?: any[]; receipt?: TransactionReceipt } | ApiError;
export type ConfirmedITXStatusResponse = { receivedTime: string; broadcasts: any[]; receipt: TransactionReceipt };

// Logger type added to window
declare global {
  interface Window {
    logger: UmbraLogger;
  }
}
