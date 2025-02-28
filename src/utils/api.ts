import axios, { AxiosResponse } from 'axios';
import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';

const BASE_URL = 'http://3.114.44.103:38088/api/v1';

const api = {
    getPairList: () => axios.get(`${BASE_URL}/pair-list`),
    getPairStat: (pair: string) => axios.get(`${BASE_URL}/pair-trade-info/${pair}`),
    getPairOrderList: (pair: string) => axios.get(`${BASE_URL}/pair-order-list/${pair}`),
    getPairTradeHistory: (pair: string) => axios.get(`${BASE_URL}/pair-trade-history/${pair}`),
    makeOrder: (orderData: any) => axios.post(`${BASE_URL}/user-make-order`, orderData),
    getUserOpenOrders: (data: any) => axios.post(`${BASE_URL}/user-open-orders`, data),
    getUserOrderHistory: (data: any) => axios.post(`${BASE_URL}/user-order-history`, data),
    getUserTradeHistory: (data: any) => axios.post(`${BASE_URL}/user-trade-history`, data),
};

// 封装的 get 请求，使用 react-query 的 useQuery 钩子
export const useGetPairList = (): UseQueryResult<AxiosResponse<any>, Error> => {
    return useQuery({ queryKey: ['pairList'], queryFn: () => api.getPairList() });
};

export const useGetPairStat = (pair: string): UseQueryResult<any, Error> => {
    return useQuery({ queryKey: ['pairStat', pair], queryFn: () => api.getPairStat(pair) });
};

export const useGetPairOrderList = (pair: string): UseQueryResult<any, Error> => {
    return useQuery({ queryKey: ['pairOrderList', pair], queryFn: () => api.getPairOrderList(pair) });
};

export const useGetPairTradeHistory = (pair: string): UseQueryResult<any, Error> => {
    return useQuery({ queryKey: ['pairTradeHistory', pair], queryFn: () => api.getPairTradeHistory(pair) });
};

// 封装的 post 请求，使用 react-query 的 useMutation 钩子
export const useMakeOrder = (onSuccessCallback: (data: any) => void): UseMutationResult<any, Error, any> => {
    return useMutation({
        mutationFn: (orderData: any) => api.makeOrder(orderData),
        onSuccess: (data) => {
            // 请求成功后执行的操作
            console.log('Order placed successfully:', data);
            onSuccessCallback(data); // 调用传入的回调函数
        },
        onError: (error) => {
            // 请求失败时的操作
            console.error('Error placing order:', error);
        },
    });
};

export const useGetUserOpenOrders = (): UseMutationResult<any, Error, any> => {
    return useMutation({ mutationFn: (data: any) => api.getUserOpenOrders(data) });
};

export const useGetUserOrderHistory = (): UseMutationResult<any, Error, any> => {
    return useMutation({ mutationFn: (data: any) => api.getUserOrderHistory(data) });
};

export const useGetUserTradeHistory = (): UseMutationResult<any, Error, any> => {
    return useMutation({ mutationFn: (data:any) => api.getUserTradeHistory(data) });
};
