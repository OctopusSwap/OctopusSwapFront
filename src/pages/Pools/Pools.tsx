import React from 'react';
import './Pools.css';

const mockPools = [
    { pairAddr: '0x123...abc', token0: 'USDC.e', token1: 'ETH', type: 'Classic', deposits: 4833480.67, apr: 2.8 },
    { pairAddr: '0x456...def', token0: 'USN', token1: 'sUSN', type: 'Range', deposits: 1761099.71, apr: 6.5, boosted: true },
    { pairAddr: '0x789...ghi', token0: 'ZK', token1: 'ETH', type: 'Classic', deposits: 1568214.34, apr: 2.2 },
    { pairAddr: '0xabc...123', token0: 'USN', token1: 'USDC.e', type: 'Range', deposits: 1179074.80, apr: 0.1 },
    { pairAddr: '0xdef...456', token0: 'ZK', token1: 'ETH', type: 'Range', deposits: 903184.00, apr: 11.6, boosted: true },
];

const getTokenIcon = (token: string) => {
    return `/images/eth.webp`;
};

const getTotalTVL = () => {
    return mockPools.reduce((total, pool) => total + pool.deposits, 0);
};

export default function Pools() {
    const totalTVL = getTotalTVL();

    return (
        <div className="pools-wrapper">
            <div className="pools-header">
                <h2>Liquidity Pools</h2>
                <div className="total-tvl">
                    <span>Total TVL:</span>
                    <strong>${totalTVL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                </div>
            </div>

            <div className="pools-container">
                {mockPools.map((pool, index) => (
                    <div className="pool-card" key={index}>
                        <div className="pool-header">
                            <div className="token-pair">
                                <div className="token">
                                    <img src={getTokenIcon(pool.token0)} alt={pool.token0} className="token-icon"/>
                                    <span>{pool.token0}</span>
                                </div>
                                <div className="token">
                                    <img src={getTokenIcon(pool.token1)} alt={pool.token1} className="token-icon"/>
                                    <span>{pool.token1}</span>
                                </div>
                            </div>
                            <div className="pool-type">{pool.type}</div>
                        </div>
                        <div className="pool-details">
                            <div className="detail">
                                <span>Deposits</span>
                                <strong>${pool.deposits.toLocaleString()}</strong>
                            </div>
                            <div className="detail">
                                <span>APR</span>
                                <strong>{pool.apr}% {pool.boosted && '⚡'}</strong>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
