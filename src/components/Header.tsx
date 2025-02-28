'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import { useGetPairStat, useGetPairList } from '@/utils/api';


function Page() {
  const pair = '0x8b1c2430908d719bff0d880e54eb2b1c498d06e6'
  const { data, error, isLoading, refetch } = useGetPairStat(pair);
  const { data: pairListData, error: pairListError, isLoading: pairListLoading } = useGetPairList();
  const [showPairList, setShowPairList] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch(); // 每隔 3 秒触发一次请求
    }, 3000);

    if(error instanceof Error) clearInterval(intervalId);

    // 清除定时器，防止内存泄漏
    return () => {
      clearInterval(intervalId);
    };
  }, [refetch, error]);

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (error instanceof Error) {
  //   return <div>Error: {error.message}</div>;
  // }

  const pairList = pairListData?.data.data;

  let statData = data?.data.data[0] || {
    pair: '',
    price: '0.00',
    high: '0.00',
    low: '0.00',
    base_volume: '0.00',
    quote_volume: '0.00',
    change: '0.00',
  };

  console.log(statData)




  return (
    <>
      <div
        className='flex items-center justify-between bg-black px-4 py-[14px] md:max-h-16 md:px-6 md:py-3'
      >
        <div className='flex h-10 items-center'>
          <div className="relative mt-4 hidden items-center md:mt-0 md:flex">
            <div className="relative mr-4 ml-4 pr-4 shrink-0">
              <div className="flex cursor-pointer items-center rounded-md px-0.5 hover:bg-gray-hover" onClick={() => setShowPairList(!showPairList)}>
                <div className="flex flex-col items-start font-bold text-white">
                  <div className="flex space-x-2">
                    BTC/USDT
                  </div>

                  {/* <div className="rounded-[4px] bg-primary-500 px-2 py-1 text-xxs leading-none text-primary">spot</div> */}
                </div>
              </div>

              {
                showPairList && <div className="absolute left-0 top-14 z-40 h-[400px] flex-col border-gray-300 bg-gray-500 p-4  md:w-[560px] ">
                  {/* <div className="flex items-center gap-x-4">
                    <p className="cursor-pointer text-sm font-bold text-primary">Search crypto</p>
                  </div> */}

                  <div className="flex items-center rounded bg-gray-700 px-4 py-2 md:bg-gray-700 mt-3 md:bg-gray-700">
                    <input type="text" className='w-full bg-transparent text-gray-200 outline-none' placeholder="Search crypto" />
                  </div>

                  <div className="mt-3 flex items-center space-x-2">
                    <div className="w-2/4 text-left text-xs text-gray-200">Pair</div>
                    <div className="w-1/4 text-left text-xs text-gray-200">Last Price</div>
                    <div className="w-1/4 text-left text-xs text-gray-200">Change</div>
                    {/* <div className="w-20 pr-2 text-right text-xs text-gray-200">Chain</div> */}
                  </div>

                  <div className="-mr-4 mt-2 flex h-[210px] flex-col overflow-y-scroll pr-4">
                    {
                      pairList?.map((item: any, index: number) => {
                        return (
                          <div key={index} className="flex cursor-pointer items-center space-x-2 py-1 hover:opacity-80">
                            <div className="flex w-2/4 items-center text-left text-xs">
                              <a href="" className='flex-1 font-bold text-white'>{item.pair}</a>
                            </div>

                            <a href="" className="w-1/4 text-left text-xs text-white">${item.last_price}</a>
                            <a href="" className="w-1/4 text-left text-xs text-white">{item.change}%</a>
                            {/* <a href="" className="flex w-20 items-center justify-end pr-2 text-white">T</a> */}
                          </div>
                        )
                      })
                    }

                  </div>
                </div>
              }

            </div>

            

            <div className="mr-4 flex flex-col items-start gap-y-2 text-right md:mr-6 md:gap-y-0">
              <p className="text-xs text-gray-200">Price</p>
              <p className={`text-xs font-bold text-white md:text-[14px]`}>{statData.price} </p>
            </div>

            <div className="mr-4 flex flex-col items-start gap-y-2 text-right md:mr-6 md:gap-y-0">
              <p className="text-xs text-gray-200">24h change</p>
              <p className={`text-xs font-bold md:text-[14px] ${statData && statData.change.toString().includes('-') ? 'text-red-500' : 'text-success'}`}>{statData.change}%</p>
            </div>

            <div className="mr-4 flex flex-col items-start gap-y-2 text-right md:mr-6 md:gap-y-0">
              <p className="text-xs text-gray-200">24h High</p>
              <p className='text-xs font-bold text-white md:text-[14px]'>{statData.high}</p>
            </div>

            <div className="mr-4 flex flex-col items-start gap-y-2 text-right md:mr-6 md:gap-y-0">
              <p className="text-xs text-gray-200">24h Low</p>
              <p className='text-xs font-bold text-white md:text-[14px]'>{statData.low}</p>
            </div>

            <div className="mr-4 flex flex-col items-start gap-y-2 text-right md:mr-6 md:gap-y-0">
              <p className="text-xs text-gray-200">24h Volume ({statData.base_token})</p>
              <p className='text-xs font-bold text-white md:text-[14px]'>{statData.base_volume}</p>
            </div>

            <div className="mr-4 flex flex-col items-start gap-y-2 text-right md:mr-6 md:gap-y-0">
              <p className="text-xs text-gray-200">24h Volume</p>
              <p className='text-xs font-bold text-white md:text-[14px]'>{statData.quote_volume}</p>
            </div>
          </div>
        </div>
        <ConnectButton showBalance={false} />
      </div>
      {showPairList && <div className="fixed left-0 top-[64px] z-30 h-full w-full bg-black opacity-60" onClick={() => setShowPairList(false)}></div>}
    </>

  );
}

export default Page;
