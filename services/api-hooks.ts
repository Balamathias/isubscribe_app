import { useMutation, useQuery } from "@tanstack/react-query";
import {
    generatePalmpayAccount,
    getAccount,
    getBeneficiaries,
    getLatestTransactions,
    getNotifications,
    getTransaction,
    getTransactions,
    getUserProfile,
    getWalletBalance,
    listDataPlans,
    processTransaction,
    verifyPhone,
    verifyPin,
    listElectricityServices,
    listTVServices,
    getAppConfig,
    verifyMerchant,
} from "./api";

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
    getNotifications: 'getNotifications',
    getBeneficiaries: 'getBeneficiaries',
    listElectricityServices: 'listElectricityServices',
    listTVServices: 'listTVServices',
    getAppConfig: 'getAppConfig',
    verifyMerchant: 'verifyMerchant',
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

export const useGetBeneficiaries = (limit: number = 5) => useQuery({
    queryKey: [QUERY_KEYS.getBeneficiaries, limit],
    queryFn: () => getBeneficiaries(limit),
    refetchOnMount: true
})

export const useListElectricityServices = () => useQuery({
    queryKey: [QUERY_KEYS.listElectricityServices],
    queryFn: listElectricityServices,
    refetchOnMount: true
})

export const useListTVServices = () => useQuery({
    queryKey: [QUERY_KEYS.listTVServices],
    queryFn: listTVServices,
    refetchOnMount: true
})

export const useGetAppConfig = () => useQuery({
    queryKey: [QUERY_KEYS.getAppConfig],
    queryFn: getAppConfig,
    refetchOnMount: true
})

export const useVerifyMerchant = () => useMutation({
    mutationKey: [QUERY_KEYS.verifyMerchant],
    mutationFn: verifyMerchant,
});