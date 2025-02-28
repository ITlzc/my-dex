"use client";
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

import { useGetUserOpenOrders } from '@/utils/api';
import dayjs from 'dayjs'

export default function OpenOrders() {
    const { address } = useAccount();
    console.log(address)
    const params = {
        "address": '0x2D4E6b96bD85248d13020D392e99558abFb4f74C',
        "limit": 20,
        "offset": 0,
        "orderBy": "date", //price
        "orderDirection": "desc",
        "pair": "0x8b1c2430908d719bff0d880e54eb2b1c498d06e6"
    }


    const { mutate, isPending, isError, error, isSuccess, data } = useGetUserOpenOrders()

    useEffect(() => {
        mutate(params)

    }, [])

    if(isPending) return <p>Loading...</p>
    // if(isError) return <p>Error: {error.message}</p>
    // if(isSuccess && data && data.length === 0) return <p>No open orders</p>

    const orderData = isSuccess && data && data.data.data
    console.log(orderData)


    function formatTime(timestamp: number) {
        return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
      }


    return (
        <div className="no-scrollbar flex flex-1 flex-col overflow-scroll">
            <div className="mt-4 flex w-full items-center border-b border-gray-300 pb-2 text-xs text-white">
                <p className="flex w-1/4 cursor-pointer items-center gap-x-1 text-left md:w-[16%]">Date </p>
                <p className="w-1/4 text-center ">Pair</p>
                <p className="flex w-1/4 cursor-pointer items-center gap-x-1 text-center md:w-[8%]">Side </p>
                <p className="hidden w-[10%] cursor-pointer items-center gap-x-1 text-left md:flex">Price </p>
                <p className="hidden w-[10%] cursor-pointer items-center gap-x-1 text-left md:flex">Amount </p>
                <p className="hidden w-[10%] cursor-pointer items-center gap-x-1 text-left md:flex">executed </p>
                <p className="hidden w-[10%] cursor-pointer items-center gap-x-1 text-left md:flex">Filled </p>
            </div>

            {isSuccess && orderData && orderData?.map((order: any, index: number) => {
                return <div key={index}>
                    <div className="flex w-full items-center border-b border-gray-300 py-2 text-xs text-white">
                        <p className="flex w-1/4 items-center gap-x-1 text-left md:w-[16%]">{formatTime(order.date)}</p>
                        <p className="w-1/4 text-center">{order.pairName}</p>
                        <p className="flex w-1/4 items-center gap-x-1 text-center md:w-[8%]">{order.side}</p>
                        <p className="hidden w-[10%] items-center gap-x-1 text-left md:flex">{order.price}</p>
                        <p className="hidden w-[10%] items-center gap-x-1 text-left md:flex">{order.total}</p>
                        <p className="hidden w-[10%] items-center gap-x-1 text-left md:flex">{order.executed}</p>
                        <p className="hidden w-[10%] items-center gap-x-1 text-left md:flex">{order.filled}%</p>
                    </div>
                </div>
            })}


        </div>
    )
}