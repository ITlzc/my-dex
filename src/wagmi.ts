import { getDefaultConfig, Chain } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

const dexTestnet = {
  id: 100199,
  name: 'DEX Testnet',
  iconBackground: '#ffc431',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://18.168.16.120:30088'] },
  },
  blockExplorers: {
    default: { name: 'dex', url: 'https://snowtrace.io' },
  },
  
} as const satisfies Chain;


export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    dexTestnet,
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
