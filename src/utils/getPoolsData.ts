import { Contract } from '@ethersproject/contracts';
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers';
import { FACTORY_ADDRESS } from 'octopusswap-sdk';
import { Interface } from '@ethersproject/abi';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import IUniswapV2Factory from '@uniswap/v2-core/build/IUniswapV2Factory.json';

const FACTORY_INTERFACE = new Interface(IUniswapV2Factory.abi);
const PAIR_INTERFACE = new Interface(IUniswapV2Pair.abi);

// 常用的 token logo API
const TOKEN_LOGO_APIS = [
    (address: string) => `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
    (address: string) => `https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
    (address: string) => `https://tokens.1inch.io/${address}.png`,
];

export interface TokenData {
    address: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
}

export interface PoolData {
    pairAddr: string;
    token0: TokenData;
    token1: TokenData;
    type: string;
    deposits: number;
    apr: number;
    boosted?: boolean;
}

async function getTokenLogoURI(tokenAddress: string): Promise<string | undefined> {
    // 首先尝试从合约获取 logoURI
    try {
        const tokenContract = new Contract(
            tokenAddress,
            ['function logoURI() view returns (string)'],
            undefined
        );
        const logoURI = await tokenContract.logoURI();
        if (logoURI) return logoURI;
    } catch (e) {
        // 如果合约没有 logoURI 方法，继续尝试其他方式
    }

    // 尝试从公共 API 获取 logo
    for (const api of TOKEN_LOGO_APIS) {
        try {
            const response = await fetch(api(tokenAddress));
            if (response.ok) {
                return api(tokenAddress);
            }
        } catch (e) {
            continue;
        }
    }

    return undefined;
}

export async function getPoolsData(provider?: Web3Provider): Promise<PoolData[]> {
    // 如果没有提供 provider，使用默认的 JsonRpcProvider
    const defaultProvider = new JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
    const usedProvider = provider || defaultProvider;
    
    const factory = new Contract(FACTORY_ADDRESS, FACTORY_INTERFACE, usedProvider);
    
    // Get all pairs
    const allPairsLength = await factory.allPairsLength();
    const pairAddresses = await Promise.all(
        Array.from({ length: Number(allPairsLength) }, (_, i) => factory.allPairs(i))
    );

    // Get data for each pair
    const poolsData = await Promise.all(
        pairAddresses.map(async (pairAddress) => {
            const pair = new Contract(pairAddress, PAIR_INTERFACE, usedProvider);
            const [token0Address, token1Address, reserves] = await Promise.all([
                pair.token0(),
                pair.token1(),
                pair.getReserves(),
            ]);

            // Get token data including logo
            const [token0, token1] = await Promise.all([
                getTokenData(token0Address, usedProvider),
                getTokenData(token1Address, usedProvider),
            ]);
            
            const tvl = calculateTVL(reserves, token0, token1);

            return {
                pairAddr: pairAddress,
                token0,
                token1,
                type: 'Classic', // For V2, all pools are classic
                deposits: tvl,
                apr: await calculateAPR(pair, tvl),
            };
        })
    );

    return poolsData;
}

async function getTokenData(tokenAddress: string, provider: Web3Provider | JsonRpcProvider): Promise<TokenData> {
    const tokenContract = new Contract(
        tokenAddress,
        ['function symbol() view returns (string)', 'function decimals() view returns (uint8)'],
        provider
    );
    const [symbol, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.decimals(),
    ]);

    // 获取 token logo
    const logoURI = await getTokenLogoURI(tokenAddress);

    return { 
        address: tokenAddress,
        symbol,
        decimals,
        logoURI
    };
}

function calculateTVL(reserves: any, token0: TokenData, token1: TokenData) {
    // This is a simplified TVL calculation
    // In a real implementation, you would:
    // 1. Get token prices from an oracle
    // 2. Calculate the value in USD
    // For now, we'll return a mock value
    return Number(reserves[0]) / Math.pow(10, token0.decimals) * 1000 + 
           Number(reserves[1]) / Math.pow(10, token1.decimals) * 1000;
}

async function calculateAPR(pair: Contract, tvl: number) {
    // This is a simplified APR calculation
    // In a real implementation, you would:
    // 1. Get historical trading volume
    // 2. Calculate fees generated
    // 3. Calculate APR based on fees and TVL
    // For now, we'll return a mock value
    return Math.random() * 10;
} 