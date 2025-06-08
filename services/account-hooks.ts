import { useMutation, useQuery } from "@tanstack/react-query";
import { 
    getAccount, 
    generatePalmpayAccount, 
    getUserProfile,
    getWalletBalance, 
    getLatestTransactions, 
    getTransactions, 
    processTransaction, 
    verifyPin, 
    listDataPlans 
} from "./accounts";

export const QUERY_KEYS = {
    getAccount: 'getAccount',
    generatePalmpayAccount: 'generatePalmpayAccount',
    getUserProfile: 'getUserProfile',
    getWalletBalance: 'getWalletBalance',
    getLatestTransactions: 'getLatestTransactions',
    getTransactions: 'getTransactions',
    processTransaction: 'processTransaction',
    verifyPin: 'verifyPin',
    listDataPlans: 'listDataPlans',
} as const

export const useGetAccount = (id?: string) => useQuery({
    queryKey: [QUERY_KEYS.getAccount, id],
    queryFn: () => getAccount(id),
})

export const useGeneratePalmpayAccount = () => useMutation({
    mutationKey: [QUERY_KEYS.generatePalmpayAccount],
    mutationFn: generatePalmpayAccount,
})

export const useGetUserProfile = () => useQuery({
    queryKey: [QUERY_KEYS.getUserProfile],
    queryFn: getUserProfile,
})

export const useGetWalletBalance = () => useQuery({
    queryKey: [QUERY_KEYS.getWalletBalance],
    queryFn: getWalletBalance,
})

export const useGetLatestTransactions = () => useQuery({
    queryKey: [QUERY_KEYS.getLatestTransactions],
    queryFn: getLatestTransactions,
})

export const useGetTransactions = (limit: number = 30, offset: number = 0) => useQuery({
    queryKey: [QUERY_KEYS.getTransactions, limit, offset],
    queryFn: () => getTransactions(limit, offset),
})

export const useProcessTransaction = () => useMutation({
    mutationKey: [QUERY_KEYS.processTransaction],
    mutationFn: processTransaction,
})

export const useVerifyPin = () => useMutation({
    mutationKey: [QUERY_KEYS.verifyPin],
    mutationFn: verifyPin,
})

export const useListDataPlans = () => useQuery({
    queryKey: [QUERY_KEYS.listDataPlans],
    queryFn: listDataPlans,
})
