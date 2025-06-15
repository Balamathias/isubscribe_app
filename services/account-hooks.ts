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
    listDataPlans,
    getTransaction,
    verifyPhone,
    getNotifications
} from "./accounts";

export const QUERY_KEYS = {
    getAccount: 'getAccount',
    generatePalmpayAccount: 'generatePalmpayAccount',
    getUserProfile: 'getUserProfile',
    getWalletBalance: 'getWalletBalance',
    getLatestTransactions: 'getLatestTransactions',
    getTransactions: 'getTransactions',
    getTransaction: 'getTransaction',
    processTransaction: 'processTransaction',
    verifyPin: 'verifyPin',
    listDataPlans: 'listDataPlans',
    verifyPhone: 'verifyPhone',
    getNotifications: 'getNotifications'
} as const

export const useGetAccount = (id?: string) => useQuery({
    queryKey: [QUERY_KEYS.getAccount, id],
    queryFn: () => getAccount(id),
    refetchOnMount: true
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
    refetchOnMount: true
})

export const useGetLatestTransactions = () => useQuery({
    queryKey: [QUERY_KEYS.getLatestTransactions],
    queryFn: getLatestTransactions,
    refetchOnMount: true
})

export const useGetTransactions = (limit: number = 30, offset: number = 0) => useQuery({
    queryKey: [QUERY_KEYS.getTransactions, limit, offset],
    queryFn: () => getTransactions(limit, offset),
})

export const useGetTransaction = (id: string) => useQuery({
    queryKey: [QUERY_KEYS.getTransaction, id],
    queryFn: () => getTransaction(id),
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
    refetchOnMount: true
})

export const useVerifyPhone = () => useMutation({
    mutationKey: [QUERY_KEYS.verifyPhone],
    mutationFn: verifyPhone,
})

export const useGetNotifications = () => useQuery({
    queryKey: [QUERY_KEYS.getNotifications],
    queryFn: getNotifications,
    refetchOnMount: true
})
