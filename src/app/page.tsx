"use client";

import { useState } from "react";

import { ethers } from "ethers";
import { useAccount, useWriteContract, useReadContract, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { useMakeOrder } from '@/utils/api'
import { Segmented } from 'antd';


import MarketTrade from "@/components/MarketTrade";
import OrderBook from "@/components/OrderBook";
import OpenOrders from "@/components/OpenOrders";
import TradingViewChart from "@/components/TradingViewChart";
import OrderHistory from "@/components/OrderHistory";
import TradHistory from '@/components/TradHistory';

const USDC_Address = "0x9250C869F063a44121a0F46364302643bb4E68D3";
const WBTC_Address = "0xe47d6011bD57E05025DBEcD82987834E1E31e7c3";
const DEX_Address = "0x8B1c2430908D719bFF0D880e54EB2B1C498d06E6";

const erc20ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "spender",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      },
      {
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];


function Page() {
  const { writeContract } = useWriteContract();
  const { address } = useAccount();
  const {
    data: hash,
    isPending,
    sendTransaction
  } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const [currentTable, setCurrentTable] = useState(1)
  const [currentList, setCurrentList] = useState('marketTrades')
  const [currentLimit, setCurrentLimit] = useState('buy')

  const [buyOrder, setBuyOrder]: any = useState({
    price: '',
    amount: '',
  })

  const [sellOrder, setSellOrder] = useState({
    price: '',
    amount: '',
  })



  const { mutate, isPending: isMakingOrder, isError, error, isSuccess } = useMakeOrder(makeOrderCallback)

  const { data: usdcAllowance } = useReadContract({
    abi: erc20ABI,
    address: USDC_Address,
    functionName: "allowance",
    args: [address, DEX_Address],
  });

  const { data: wbtcAllowance } = useReadContract({
    abi: erc20ABI,
    address: WBTC_Address,
    functionName: "allowance",
    args: [address, DEX_Address],
  });

  const { data: usdcBalance, isLoading: isLoadingUsdc, error: usdcError } = useReadContract({
    abi: erc20ABI,
    address: USDC_Address,
    functionName: 'balanceOf',
    args: [address],
  });

  // 查询 WBTC 余额
  const { data: wbtcBalance, isLoading: isLoadingWbtc, error: wbtcError } = useReadContract({
    abi: erc20ABI,
    address: WBTC_Address,
    functionName: 'balanceOf',
    args: [address],
  });

  console.log(usdcBalance, wbtcBalance)

  // 确保 usdcBalance 和 wbtcBalance 是 BigNumberish 类型
  const formattedUsdcBalance = usdcBalance ? Number(ethers.formatUnits(usdcBalance.toString())).toFixed(5) : '0';
  const formattedWbtcBalance = wbtcBalance ? Number(ethers.formatUnits(wbtcBalance.toString())).toFixed(5) : '0';

  console.log(formattedUsdcBalance, formattedWbtcBalance)

  async function makeOrderCallback(resData: any) {
    try {
      if (!resData || !resData.data || resData.data.code !== 200) return
      resData = resData.data.data[0]

      const approvalPromises = [];


      if (Number(usdcAllowance) === 0) {
        const usdc_approveTx: any = await writeContract({
          abi: erc20ABI,
          address: USDC_Address,
          functionName: "approve",
          args: [DEX_Address, ethers.MaxUint256],
        });

        const usdc_approvePromise = new Promise((resolve, reject) => {
          const { isLoading, isSuccess } = useWaitForTransactionReceipt({
            hash: usdc_approveTx.hash,
          });

          if (isSuccess) {
            console.log('USDC approved');
            resolve(true);
          } else if (isLoading) {
            console.log('Waiting for USDC approval...');
          } else {
            reject(new Error('USDC approval failed'));
          }
        });
        approvalPromises.push(usdc_approvePromise);
      }

      if (Number(wbtcAllowance) === 0) {
        const wbtc_approveTx: any = await writeContract({
          abi: erc20ABI,
          address: WBTC_Address,
          functionName: "approve",
          args: [DEX_Address, ethers.MaxUint256],
        });


        const wbtc_approvePromise = new Promise((resolve, reject) => {
          const { isLoading, isSuccess } = useWaitForTransactionReceipt({
            hash: wbtc_approveTx.hash,
          });

          if (isSuccess) {
            console.log('WBTC approved');
            resolve(true);
          } else if (isLoading) {
            console.log('Waiting for WBTC approval...');
          } else {
            reject(new Error('WBTC approval failed'));
          }
        });

        approvalPromises.push(wbtc_approvePromise);
      }

      await Promise.all(approvalPromises);

      if (Number(usdcAllowance) > 0 && Number(wbtcAllowance) > 0) {
        console.log('approved')
        const tx: any = {
          to: resData.to,
          value: ethers.parseEther(resData.value), // 发送金额 (以太)，转换为 Wei 单位
          data: '0x' + resData.data,
          gas: parseInt(resData.gas_limit),
          gasPrice: parseInt(resData.gas_price),
        };

        sendTransaction(tx)
      }
    } catch (error) {
      console.log(error)
    }

  }

  async function createOrder(type: string) {
    try {
      const order = type === 'buy' ? buyOrder : sellOrder
      if (!order.price || !order.amount) return
      const orderData = {
        user: address,
        amount: String(order.amount),
        price: String(order.price),
        side: type === 'buy' ? 0 : 1,
        pair: '0x8b1c2430908d719bff0d880e54eb2b1c498d06e6'
      };

      mutate(orderData);
    } catch (error) {

    }
  }



  return (
    <div className="flex max-h-full w-full flex-1 items-stretch">
      <div className="flex max-h-full w-full flex-col">
        <div className="hidden min-h-full md:flex md:flex-col">
          <div className="flex  w-full flex-1 flex-col max-h-[calc(100vh-300px)]">
            <div className="flex min-h-full flex-1 items-start">
              <div className="h-full w-full flex-1 bg-black">
                <TradingViewChart symbol="" />
              </div>

              <div className="flex h-full h-[calc(100vh-300px)] w-80 flex-col gap-y-4 overflow-y-hidden rounded border border-gray-300 bg-black py-4">
                <div className="flex items-center gap-x-6 text-[14px] font-bold border-b border-gray-300 px-4">
                  <p className={`${currentList === 'marketTrades' ? 'text-white border-white' : 'text-[#909090] border-transparent'} border-b-2 pb-2 cursor-pointer hover:text-white`} onClick={() => setCurrentList('marketTrades')}>Last trades</p>
                  <p className={`${currentList === 'Orderbook' ? 'text-white border-white' : 'text-[#909090] border-transparent'} border-b-2 pb-2 cursor-pointer hover:text-white`} onClick={() => setCurrentList('Orderbook')}>Order book</p>
                </div>

                {currentList === 'marketTrades' ? <div className="flex h-[323px] w-full flex-col rounded bg-black md:h-full px-4">
                  <div className="mt-4 flex w-full items-center gap-x-3 md:mt-0">
                    <p className="w-1/3 text-left text-[10px] text-gray-200">Price (USDT)</p>
                    <p className="w-1/3 text-center text-[10px] text-gray-200">Size (BTC)</p>
                    <p className="w-1/3 text-right text-[10px] text-gray-200">Time</p>
                  </div>

                  <MarketTrade />
                </div> : <div className="flex h-[323px] w-full flex-col rounded bg-black px-4 md:h-full">
                  <div className="mt-4 flex w-full items-center gap-x-3 md:mt-0">
                    <p className="w-1/2 text-left text-[10px] text-gray-200">Price (USDT)</p>
                    <p className="w-1/2 text-right text-[10px] text-gray-200">Amount (BTC)</p>
                    <p className="w-1/2 text-left text-[10px] text-gray-200">Total (BTC)</p>
                  </div>

                  <OrderBook />
                </div>}
              </div>

              <div className="h-full">
                <div className="fixed bottom-0 z-20 h-full w-80 flex-col justify-start rounded border-y border-gray-300 bg-black md:relative md:flex py-4">
                  <div className="md:block">
                    <div className="my-8 flex items-center gap-x-6 text-[14px] md:mb-4 md:mt-0 border-b border-gray-300 px-4">
                      <p className="font-semibold text-white border-b-2 pb-2">Trade</p>
                    </div>

                    {/* <Segmented options={['Buy', 'Sell']} block /> */}

                    <div className="px-4">
                      <div className="w-full flex justify-between items-center px-1 py-1 bg-gray-700 h-[36px] mb-4 rounded-md">
                        <button onClick={() => setCurrentLimit('buy')} className={`${currentLimit === 'buy' ? 'text-white bg-[#25a750]' : 'text-white'} w-[50%] h-full rounded cursor-pointer text-xs`} >Buy</button>
                        <button onClick={() => setCurrentLimit('sell')} className={`${currentLimit === 'sell' ? 'text-white bg-[#ca3f64]' : 'text-white'} w-[50%] h-full rounded cursor-pointer text-xs`} >Sell</button>
                      </div>


                      <div className="flex justify-center gap-6">
                        {currentLimit === 'buy' && <div className="flex w-full flex-col md:w-full">
                          <div className="flex w-full flex-col gap-y-3 md:w-full null ">

                            <div className="flex h-8 w-full flex-col items-center justify-center rounded border bg-gray-700 p-2 border-transparent">
                              <div className="flex h-full w-full items-center text-xs">
                                <p className="text-gray-200">Price</p>
                                <input type="number" value={buyOrder.price} onChange={(e) => setBuyOrder({ ...buyOrder, price: e.target.value })} placeholder="0.0" className="mx-1 w-full flex-1 bg-transparent outline-none placeholder:text-gray-200 text-left text-white" />
                                <p className="text-white">USDT</p>
                              </div>
                            </div>

                            <div className="flex h-8 w-full flex-col items-center justify-center rounded border bg-gray-700 p-2 border-transparent">
                              <div className="flex h-full w-full items-center text-xs">
                                <p className="text-gray-200">Amount</p>
                                <input type="number" value={buyOrder.amount} onChange={(e) => setBuyOrder({ ...buyOrder, amount: e.target.value })} placeholder="0.0" className="mx-1 w-full flex-1 bg-transparent outline-none placeholder:text-gray-200 text-left text-white" />
                                <p className="text-white">BTC</p>
                              </div>
                            </div>

                            <div className="flex h-8 w-full flex-col items-center justify-center rounded border bg-gray-700 p-2 md:mt-4 border-transparent">
                              <div className="flex h-full w-full items-center text-xs">
                                <p className="text-gray-200">Total</p>
                                <input type="number" defaultValue={Number(buyOrder.price * buyOrder.amount).toFixed(1)} placeholder="0.0" className="mx-1 w-full flex-1 bg-transparent outline-none placeholder:text-gray-200 text-left text-white" />
                                <p className="text-white">USDT</p>
                              </div>
                            </div>

                            <span className="flex h-4 items-center text-[9px] text-danger"></span>

                            <button disabled={isPending || isMakingOrder} onClick={() => createOrder('buy')} className="inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-[14px] font-semibold transition duration-100 ease-out hover:ease-in button-success text-[14px] text-white">
                              Buy BTC
                            </button>
                          </div>
                        </div>}

                        {currentLimit === 'sell' && <div className="flex w-full flex-col md:w-full">
                          <div className="flex w-full flex-col gap-y-3 md:w-full null ">
                            <div className="flex h-8 w-full flex-col items-center justify-center rounded border bg-gray-700 p-2 border-transparent">
                              <div className="flex h-full w-full items-center text-xs">
                                <p className="text-gray-200">Price</p>
                                <input type="number" placeholder="0.0" className="mx-1 w-full flex-1 bg-transparent outline-none placeholder:text-gray-200 text-left text-white" />
                                <p className="text-white">USDT</p>
                              </div>
                            </div>

                            <div className="flex h-8 w-full flex-col items-center justify-center rounded border bg-gray-700 p-2 border-transparent">
                              <div className="flex h-full w-full items-center text-xs">
                                <p className="text-gray-200">Amount</p>
                                <input type="number" placeholder="0.0" className="mx-1 w-full flex-1 bg-transparent outline-none placeholder:text-gray-200 text-left text-white" />
                                <p className="text-white">BTC</p>
                              </div>
                            </div>

                            <div className="flex h-8 w-full flex-col items-center justify-center rounded border bg-gray-700 p-2 md:mt-4 border-transparent">
                              <div className="flex h-full w-full items-center text-xs">
                                <p className="text-gray-200">Total</p>
                                <input type="number" placeholder="0.0" className="mx-1 w-full flex-1 bg-transparent outline-none placeholder:text-gray-200 text-left text-white" />
                                <p className="text-white">USDT</p>
                              </div>
                            </div>

                            <span className="flex h-4 items-center text-[9px] text-danger"></span>

                            <button disabled={isPending || isMakingOrder} onClick={() => createOrder('sell')} className="inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-[14px] font-semibold transition duration-100 ease-out hover:ease-in button-danger text-[14px] text-white">
                              Sell BTC
                            </button>
                          </div>
                        </div>}
                      </div>
                    </div>


                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full border-t border-gray-300  md:h-[300px]">
            <div className="h-full flex-1 border-r border-gray-300">
              <div className="relative mt-4 flex h-[234px] w-full flex-col rounded bg-black p-4 md:mt-0 md:h-full md:p-4">
                <div className="flex items-center">
                  <div className="flex w-2/4 gap-x-4">
                    <div className={`cursor-pointer  rounded text-center text-[14px] font-bold text-gray-200 transition-all hover:text-white ${currentTable === 1 && 'text-primary'}`} onClick={() => setCurrentTable(1)}>Open Orders (0)</div>
                    <div className={`cursor-pointer  rounded text-center text-[14px] font-bold text-gray-200 transition-all hover:text-white ${currentTable === 2 && 'text-primary'}`} onClick={() => setCurrentTable(2)}>Order History (0)</div>
                    <div className={`cursor-pointer  rounded text-center text-[14px] font-bold text-gray-200 transition-all hover:text-white ${currentTable === 3 && 'text-primary'}`} onClick={() => setCurrentTable(3)}>Trade History (0)</div>
                  </div>

                  <div className="flex w-2/4 items-center justify-end gap-x-4">
                    {/* <button className="inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-[14px] font-semibold transition duration-100 ease-out hover:ease-in button-outline h-8 px-6 py-3 font-normal text-white">Order Management</button> */}
                    {
                      false && <div className="flex cursor-pointer items-center gap-x-1 font-bold">
                        <input type="checkbox" className="accent-primary md:bg-transparent" />
                        <p className="text-xs text-white"> Hide Other Pairs</p>
                      </div>
                    }

                  </div>
                </div>

                {currentTable === 1 && <OpenOrders />}
                {currentTable === 2 && <OrderHistory />}
                {currentTable === 3 && <TradHistory />}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
