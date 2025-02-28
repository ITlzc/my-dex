"use client";
import dayjs from 'dayjs'
import { useGetPairOrderList } from '@/utils/api'

export default function OrderBook() {

  const pair = '0x8b1c2430908d719bff0d880e54eb2b1c498d06e6'
  const { data, error, isLoading, refetch } = useGetPairOrderList(pair);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error instanceof Error) {
    return <div>Error: {error.message}</div>;
  }

  let bitsData = data?.data.data && data?.data.data[0].bids;
  let asksData = data?.data.data && data?.data.data[0].asks;

  return (
    <div className="no-scrollbar flex flex-col w-full items-start overflow-y-scroll">
       <div className="mt-2 flex w-full flex-col">
        {asksData && asksData.map((item: any, index: number) =>
          <div key={index} className="item-center flex h-[26px] w-full cursor-pointer py-1 text-xs hover:opacity-80 md:h-[28px]">
            <p className={`mr-2 w-1/2 text-left text-red-500`}>{item.price}</p>
            <p className="mr-2 w-1/2 text-right text-white">{item.amount && item.amount.slice(0, 8)}</p>
            <p className="mr-2 w-1/2 text-right text-white">{item.price && item.amount && (Number(item.price) * Number(item.amount)).toFixed(6)}</p>
          </div>)}
      </div>

      <div className="mt-2 flex w-full flex-col">
        {bitsData && bitsData.map((item: any, index: number) =>
          <div key={index} className="item-center flex h-[26px] w-full cursor-pointer py-1 text-xs hover:opacity-80 md:h-[28px]">
            <p className="mr-2 w-1/2 text-left text-success">{item.price}</p>
            <p className={`mr-2 w-1/2 text-right text-white`}>{item.amount && item.amount}</p>
            <p className="mr-2 w-1/2 text-right text-white">{item.price && item.amount && (Number(item.price) * Number(item.amount)).toFixed(6)}</p>
          </div>)}
      </div>

     


    </div>
  )
}