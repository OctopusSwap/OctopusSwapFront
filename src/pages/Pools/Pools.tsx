import React, { useEffect, useState, useMemo } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useHistory } from 'react-router-dom';
import { getPoolsData, PoolData, TokenData } from '../../utils/getPoolsData';
import './Pools.css';

const getTokenIcon = (token: TokenData) => {
    if (token.logoURI) {
        return token.logoURI;
    }
    return `/images/eth.webp`;
};

const ITEMS_PER_PAGE = 10;

export default function Pools() {
    const { library } = useWeb3React<Web3Provider>();
    const history = useHistory();
    const [pools, setPools] = useState<PoolData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchPools = async () => {
            if (library) {
                try {
                    const poolsData = await getPoolsData(library);
                    setPools(poolsData);
                } catch (error) {
                    console.error('Failed to fetch pools:', error);
                }
                setLoading(false);
            }
        };

        fetchPools();
    }, [library]);

    // 过滤和分页逻辑
    const filteredPools = useMemo(() => {
        return pools.filter(pool => {
            const searchLower = searchTerm.toLowerCase();
            return (
                pool.token0.symbol.toLowerCase().includes(searchLower) ||
                pool.token1.symbol.toLowerCase().includes(searchLower) ||
                pool.pairAddr.toLowerCase().includes(searchLower)
            );
        });
    }, [pools, searchTerm]);

    const totalPages = Math.ceil(filteredPools.length / ITEMS_PER_PAGE);
    const currentPools = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPools.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPools, currentPage]);

    const handlePoolClick = (pool: PoolData) => {
        history.push(`/add/${pool.token0.address}/${pool.token1.address}`);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // 重置到第一页
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const totalTVL = pools.reduce((total, pool) => total + pool.deposits, 0);

    if (loading) {
        return <div className="pools-wrapper">Loading pools data...</div>;
    }

    return (
        <div className="pools-wrapper">
            <div className="pools-header">
                <h2>Liquidity Pools</h2>
                <div className="header-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by token name or address..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="total-tvl">
                        <span>Total TVL:</span>
                        <strong>${totalTVL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                    </div>
                </div>
            </div>

            <div className="pools-container">
                {currentPools.map((pool) => (
                    <div 
                        className="pool-card" 
                        key={pool.pairAddr}
                        onClick={() => handlePoolClick(pool)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="pool-header">
                            <div className="token-pair">
                                <div className="token">
                                    <img 
                                        src={getTokenIcon(pool.token0)} 
                                        alt={pool.token0.symbol} 
                                        className="token-icon"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/images/eth.webp';
                                        }}
                                    />
                                    <span>{pool.token0.symbol}</span>
                                </div>
                                <div className="token">
                                    <img 
                                        src={getTokenIcon(pool.token1)} 
                                        alt={pool.token1.symbol} 
                                        className="token-icon"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/images/eth.webp';
                                        }}
                                    />
                                    <span>{pool.token1.symbol}</span>
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
                                <strong>{pool.apr.toFixed(1)}% {pool.boosted && '⚡'}</strong>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? 'active' : ''}
                        >
                            {page}
                        </button>
                    ))}
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}