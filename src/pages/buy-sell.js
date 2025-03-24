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
import  StockModal  from '@/components/StockModel';
import { useSession } from 'next-auth/react';


const buySell = ({ initialStocks }) => {
    const router = useRouter();
    const links = navLinks;
    const [stocksData, setStocksData] = useState(initialStocks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [mounted, setMounted] = useState(false);
    const { data: session , status} = useSession();
    const loading = status === 'loading';

    useEffect(() => {
        setMounted(true);
      }, []);
    
    
      if (!mounted) return null;

    if (loading) return <div>loading...</div>;

    // if (!session|| !session.user) {
    //     router.push("/login");
    //     return null;
    // }

    

    const handleStockClick = (symbol) => {
        const stock = stocksData.stockData.find(stock => stock.symbol === symbol);
        setSelectedStock(stock);
        console.log(stock);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStock(null);
    };


return (
    <section className='bg-gray-200 h-[100vh] dark:bg-zinc-950'>
        <Logo />
        <div className='heading flex justify-evenly text-4xl font-bold mt-4 ml-5 mb-8'>Add to your Portfolio</div>
        <div className='ml-5 grid lg:grid-cols-3 xl:grid-cols-4 gap-4 grid-cols-2'>
            {
                stocksData.stockData.map((stock) => (
                    <div onClick={() => handleStockClick(stock.symbol)} key={stock.symbol}>
                        <CardSpotlight className="flex justify-start items-center h-52 w-100%] rounded-xl">
                            <div className='py-5 z-50'>
                                <Image src={stock.img} height={100} width={100} alt='stocks_logo' />
                                <div className='text-xl font-semibold mt-4'>{stock.stockName}</div>
                            </div>
                            <div className='w-full flex flex-col justify-end text-xl font-bold text-green-600'>
                                {stock.price.o < stock.price.c ?
                                    (<div className='flex justify-end text-xl font-bold text-green-600'>${stock.price.c}</div>)
                                    : (<div className='flex justify-end text-xl font-bold text-red-600'>${stock.price.c}</div>)}
                                <div>{stock.price.o < stock.price.c ? (<div className='flex justify-end text-sm font-bold text-green-600'>
                                    {((stock.price.c - stock.price.o) / stock.price.o).toFixed(2)}%
                                </div>) : (<div className='flex justify-end text-sm font-bold text-red-600'>
                                    {((stock.price.c - stock.price.o) / stock.price.o).toFixed(2)}%
                                </div>)}</div>
                            </div>
                        </CardSpotlight>
                    </div>
                ))

            }
        </div>

        {isModalOpen && ( <StockModal symbol={selectedStock.symbol} onClose={handleCloseModal} /> )}










        <div className='flex fixed bottom-10  items-center justify-center h-[3rem] w-full'>
            <FloatingDock
                items={links}
            />
        </div>


    </section>
)
}

export default buySell

// export async function getServerSideProps(context) {
//     try {
//         const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000";

//         const stockRes = await axios.get(`${baseURL}/api/top-stocks`, {
//             params: { page: "top-stocks" },
//         });

//         return {
//             props: {
//                 initialStocks: stockRes.data,
//             },
//         };
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         return {
//             props: {
//                 initialStocks: {},
//             },
//         };
//     }
// }