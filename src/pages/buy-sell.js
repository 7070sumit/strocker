import React from 'react'
import { FloatingDock } from "../components/ui/floating-doc";
import Logo from "@/components/logo"
import { CardSpotlight } from '@/components/ui/card-spotlight';
import navLinks from "@/utils/navLinks"
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import StockModal from '@/components/StockModel';
import { useSession } from 'next-auth/react';

const BuySell = ({ initialStocks }) => {
    const router = useRouter();
    const links = navLinks;
    const [stocksData, setStocksData] = useState(initialStocks || { stockData: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [mounted, setMounted] = useState(false);
    const { data: session, status } = useSession();
    const loading = status === 'loading';

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-full bg-gray-200 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!session || !session.user) {
        router.push("/login");
        return null;
    }

    const handleStockClick = (symbol) => {
        const stock = stocksData.stockData?.find(stock => stock.symbol === symbol);
        if (stock) {
            setSelectedStock(stock);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStock(null);
    };

    return (
        <section className="bg-gray-200 dark:bg-zinc-950 min-h-screen pb-20">
            <Logo />
            
            {/* Responsive heading with proper spacing */}
            <div className="text-center px-4 my-6 md:my-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                    Add to your Portfolio
                </h1>
            </div>

            {/* Responsive grid with proper spacing and sizing */}
            <div className="px-4 sm:px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                {stocksData?.stockData?.length > 0 ? (
                    stocksData.stockData.map((stock) => (
                        <div 
                            onClick={() => handleStockClick(stock.symbol)} 
                            key={stock.symbol}
                            className="cursor-pointer hover:scale-[1.01] transition-transform"
                        >
                            <CardSpotlight className="flex justify-start items-center h-auto min-h-44 md:min-h-52 w-full rounded-xl p-4">
                                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row w-full items-center">
                                    {/* Stock info section */}
                                    <div className='flex flex-col items-center sm:items-start md:items-center lg:items-start z-10 mr-2'>
                                        <div className="relative h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24">
                                            <Image 
                                                src={stock.img} 
                                                layout="fill" 
                                                objectFit="contain"
                                                alt={`${stock.stockName} logo`}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.png'; // Fallback image
                                                }}
                                            />
                                        </div>
                                        <div className='text-lg md:text-xl font-semibold mt-2 text-center sm:text-left md:text-center lg:text-left'>
                                            {stock.stockName}
                                        </div>
                                    </div>

                                    {/* Price section */}
                                    <div className='w-full flex flex-col justify-end items-end mt-3 sm:mt-0'>
                                        {stock.price.o < stock.price.c ? (
                                            <div className='text-lg md:text-xl font-bold text-green-600'>
                                                ${parseFloat(stock.price.c).toFixed(2)}
                                            </div>
                                        ) : (
                                            <div className='text-lg md:text-xl font-bold text-red-600'>
                                                ${parseFloat(stock.price.c).toFixed(2)}
                                            </div>
                                        )}
                                        
                                        {stock.price.o < stock.price.c ? (
                                            <div className='text-sm font-bold text-green-600'>
                                                +{((stock.price.c - stock.price.o) / stock.price.o * 100).toFixed(2)}%
                                            </div>
                                        ) : (
                                            <div className='text-sm font-bold text-red-600'>
                                                {((stock.price.c - stock.price.o) / stock.price.o * 100).toFixed(2)}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardSpotlight>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex justify-center items-center py-12">
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                            No stocks available at the moment. Please try again later.
                        </p>
                    </div>
                )}
            </div>

            {/* Stock Modal - position fixed to ensure it's centered on all devices */}
            {isModalOpen && selectedStock && (
                <StockModal symbol={selectedStock.symbol} onClose={handleCloseModal} />
            )}

            {/* Floating dock with responsive height and positioning */}
            <div className='fixed bottom-0 left-0 right-0 flex items-center justify-center h-16 md:h-20 pb-4 md:pb-6 w-full z-20'>
                <FloatingDock items={links} />
            </div>
        </section>
    )
}

export default BuySell;

export async function getServerSideProps(context) {
    try {
        // Use absolute URL for API calls to avoid relative path issues
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const baseURL = process.env.NEXTAUTH_URL || `${protocol}://${context.req.headers.host}`;

        const stockRes = await axios.get(`${baseURL}/api/top-stocks`, {
            params: { page: "top-stocks" },
            timeout: 5000 // Add timeout to prevent hanging requests
        });

        return {
            props: {
                initialStocks: stockRes.data || { stockData: [] },
            },
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return {
            props: {
                initialStocks: { stockData: [] },
            },
        };
    }
}