import { useMutation, useQuery } from "@tanstack/react-query";
import {
    createRating,
    deleteAccount,
    generatePalmpayAccount,
    getAccount,
    getAppConfig,
    getBeneficiaries,
    getLatestTransactions,
    getNotifications,
    getTransaction,
    getTransactions,
    getUserProfile,
    getWalletBalance,
    listDataPlans,
    listElectricityServices,
    listRatings,
    listTVServices,
    processTransaction,
    requestPinResetOTP,
    resetPinWithOTP,
    verifyMerchant,
    verifyPhone,
    verifyPin,
    verifyResetPinOTP,
    generateReservedAccount,
    createPushToken,
    updateProfile,
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
    listRatings: 'listRatings',
    createRating: 'createRating',
    deleteAccount: 'deleteAccount',
    resetPinWithOTP: 'resetPinWithOTP',
    verifyResetPinOTP: 'verifyResetPinOTP',
    requestPinResetOTP: 'requestPinResetOTP',
    generateReservedAccount: 'generateReservedAccount',
    createPushToken: 'createPushToken',
    updateProfile: 'updateProfile',
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
})

export const useGetLatestTransactions = () => useQuery({
    queryKey: [QUERY_KEYS.getLatestTransactions],
    queryFn: getLatestTransactions,
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
})

export const useListElectricityServices = () => useQuery({
    queryKey: [QUERY_KEYS.listElectricityServices],
    queryFn: listElectricityServices,
})

export const useListTVServices = () => useQuery({
    queryKey: [QUERY_KEYS.listTVServices],
    queryFn: listTVServices,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
})

export const useGetAppConfig = () => useQuery({
    queryKey: [QUERY_KEYS.getAppConfig],
    queryFn: getAppConfig,
})

export const useVerifyMerchant = () => useMutation({
    mutationKey: [QUERY_KEYS.verifyMerchant],
    mutationFn: verifyMerchant,
});

export const useListRatings = (limit?: number, offset?: number) => useQuery({
    queryKey: [QUERY_KEYS.listRatings, limit, offset],
    queryFn: () => listRatings(limit, offset),
});

export const useCreateRating = () => useMutation({
    mutationKey: [QUERY_KEYS.createRating],
    mutationFn: createRating,
});

export const useDeleteAccount = () => useMutation({
    mutationKey: [QUERY_KEYS.deleteAccount],
    mutationFn: deleteAccount,
});

export const useResetPinWithOTP = () => useMutation({
    mutationKey: [QUERY_KEYS.resetPinWithOTP],
    mutationFn: resetPinWithOTP,
});

export const useVerifyResetPinOTP = () => useMutation({
    mutationKey: [QUERY_KEYS.verifyResetPinOTP],
    mutationFn: verifyResetPinOTP,
});

export const useRequestPinResetOTP = () => useMutation({
    mutationKey: [QUERY_KEYS.requestPinResetOTP],
    mutationFn: requestPinResetOTP,
});

export const useGenerateReservedAccount = () => useMutation({
    mutationKey: [QUERY_KEYS.generateReservedAccount],
    mutationFn: generateReservedAccount,
});

export const useCreatePushToken = () => useMutation({
    mutationKey: [QUERY_KEYS.createPushToken],
    mutationFn: createPushToken,
});

export const useUpdateProfile = () => useMutation({
    mutationKey: [QUERY_KEYS.updateProfile],
    mutationFn: updateProfile,
});