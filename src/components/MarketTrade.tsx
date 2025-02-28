"use client";
import dayjs from 'dayjs'
import { useGetPairTradeHistory } from '@/utils/api'

export default function MarketTrade() {

    const pair = '0x8b1c2430908d719bff0d880e54eb2b1c498d06e6'
    const { data, error, isLoading, refetch } = useGetPairTradeHistory(pair);

    if (isLoading) {
        return <div className='no-scrollbar mt-2 flex w-full flex-col overflow-y-scroll'>Loading...</div>;
      }
    
      if (error instanceof Error) {
        return <div>Error: {error.message}</div>;
      }
    
      let tradData = data?.data.data && data?.data.data.slice(0, 40);
    
      function formatTime(timestamp: number) {
        return dayjs(timestamp*1000).format('MM-DD HH:mm:ss')
      }
    return (
        <div className="no-scrollbar mt-2 flex w-full flex-col overflow-y-scroll">
            {tradData && tradData.map((item: any, index: number) =>
                <div key={index} className="item-center flex h-[26px] w-full cursor-pointer py-1 text-xs hover:opacity-80 md:h-[28px] green-blink">
                    <p className={`w-1/3 text-left ${item.side === 0 ? 'text-success' : 'text-red-500'}`}>{item.price}</p>
                    <p className="w-1/3 text-center text-white">{item.amount && item.amount.slice(0, 8)}</p>
                    <a href="#" className="w-1/3 text-right text-white">{formatTime(item.time)}</a>
                </div>)}
        </div>
    )
}