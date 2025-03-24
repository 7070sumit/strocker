import React, { use } from 'react'
import { FloatingDock } from "../components/ui/floating-doc";
import Theme from "@/components/theme-changer";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";
import navLinks from "@/utils/navLinks"
import Logo from "@/components/logo"
import axios from "axios";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import CountUp from 'react-countup';

import { FaCaretUp } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";
import { delay } from 'framer-motion';

// Mock data for testing
const mockStockData = {
  "AAPL": { c: 187.68, o: 184.35 },
  "MSFT": { c: 423.56, o: 425.10 },
  "AMZN": { c: 178.25, o: 175.50 },
  "TSLA": { c: 182.55, o: 185.20 }
};

const mockProfile = [
  { symbol: "AAPL", quantity: 10 },
  { symbol: "MSFT", quantity: 5 },
  { symbol: "AMZN", quantity: 8 },
  { symbol: "TSLA", quantity: 12 }
];

const portfolio = ({ initialProfile }) => {
    const [mounted, setMounted] = useState(false);
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const [profile, setProfile] = useState(initialProfile || mockProfile);
    const router = useRouter();
    const [stockData, setStockData] = useState({});
    const title="Your Portfolio";

    useEffect(() => {
        setMounted(true);
        
        // Using mock data for now - remove this when ready to use API
        setStockData(mockStockData);
        
        // Uncomment this when API is ready
        async function getStockData() {
            try {
                const data = await Promise.all(
                    profile.map(async (stock) => {
                        const response = await axios.get(`/api/fetch-stockData?symbol=${stock.symbol}`);
                        return { symbol: stock.symbol, data: response.data.stockData };
                    })
                );

                const stockDataMap = data.reduce((acc, curr) => {
                    acc[curr.symbol] = curr.data;
                    return acc;
                }, {});
                setStockData(stockDataMap);
            } catch (error) {
                console.error("Error fetching stock data:", error);
            }
        }

        getStockData();
    }, [profile]);

    if (!mounted) return null;

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!session || !session.user) {
      router.push("/login");
    }

    const links = navLinks;

    const getTotalAssetValue = () => {
        return profile.reduce((total, stock) => {
            const stockPrice = stockData[stock.symbol]?.c || 0; // Use 0 if the price is unavailable
            return total + stockPrice * stock.quantity;
        }, 0).toFixed(2); // Round to 2 decimal places
    };

    return (
        <div className='bg-gray-200 h-[100vh] dark:bg-zinc-950'>
            <Logo />

            <div className='heading flex justify-evenly text-4xl font-bold mt-4 ml-5 mb-8'>Your Portfolio</div>
            <div className='flex flex-col justify-center items-center bg-white dark:bg-zinc-900 drop-shadow-2xl p-6 mx-5 rounded-3xl'>
                <div className='text-7xl font-bold'>$<CountUp end={parseFloat(getTotalAssetValue())} delay={5}/></div>
                <div className='mt-4'>Total Asset</div>
            </div>

            {profile.map((stock, index) => (
                <div key={index} className='border-b-2 dark:border-white border-zinc-900 drop-shadow-2xl bg-gray-200 dark:bg-zinc-900 mt-4 p-6 mx-5 rounded-3xl'>
                    <div className='flex justify-between'>
                        <div className='flex items-center text-2xl font-bold'>
                            <TextGenerateEffect words={stock.symbol}/>
                        </div>
                        <div className='text-end flex flex-col justify-end'>
                            {stockData[stock.symbol]?.c < stockData[stock.symbol]?.o ? (
                                <div className='flex items-center justify-end text-xl font-bold text-red-600'> 
                                    ${((stockData[stock.symbol]?.c || 0) * stock.quantity).toFixed(2)}
                                    <span className='text-sm'>&nbsp;
                                        {stockData[stock.symbol] ? ((stockData[stock.symbol].c - stockData[stock.symbol].o) / stockData[stock.symbol].o * 100).toFixed(2) : 0}%
                                    </span>
                                </div>
                            ) : (
                                <div className='flex items-center justify-end text-xl font-bold text-green-600'> 
                                    ${((stockData[stock.symbol]?.c || 0) * stock.quantity).toFixed(2)}
                                    <span className='text-sm'>&nbsp;
                                        {stockData[stock.symbol] ? ((stockData[stock.symbol].c - stockData[stock.symbol].o) / stockData[stock.symbol].o * 100).toFixed(2) : 0}%
                                    </span>
                                </div>
                            )}
                            <div className='text-sm text-end py-3'>Qty:&nbsp;{stock.quantity}</div>
                            {stockData[stock.symbol]?.c < stockData[stock.symbol]?.o ? (
                                <div className='flex items-center justify-end text-sm font-bold text-red-600'>
                                    <span className='dark:text-white text-black'>LTP: &nbsp; </span>
                                    <FaCaretDown /> ${(stockData[stock.symbol]?.c || 0).toFixed(2)}
                                </div>
                            ) : (
                                <div className='flex items-center justify-end text-sm font-bold text-green-600'>
                                    <span className='dark:text-white text-black'>LTP: &nbsp; </span>
                                    <FaCaretUp /> ${(stockData[stock.symbol]?.c || 0).toFixed(2)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <Theme />
            <div className="flex fixed bottom-10 items-center justify-center h-[3rem] w-full">
                <FloatingDock items={links} />
            </div>
        </div>
    );
};

export default portfolio;

export async function getServerSideProps(context) {
    try {
        const session = await getSession(context);
        if (!session) {
            return {
                redirect: {
                    destination: "/login",
                    permanent: false,
                },
            };
        }

        const email = session.user.email;
        const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000";

        const profileRes = await axios.get(`${baseURL}/api/get-portfolio-data`, {
            params: { email },
        });

        return {
            props: {
                initialProfile: profileRes.data.data,
            },
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return {
            props: {
                initialProfile: [],
            },
        };
    }
}