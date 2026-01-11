import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    listPromoBanners,
    generateWebAuthLink,
    getRecentDataPurchases,
    getTransactionAnalytics,
    // Guest checkout / Wallet funding
    initiateGuestTransaction,
    getGuestTransactionStatus,
    // Education
    listEducationServices,
    verifyEducationMerchant,
    type VerifyEducationMerchantRequest,
    // Inter-wallet transfer
    lookupTransferRecipient,
    initiateTransfer,
    getTransferLimits,
    getRecentTransferRecipients,
    type InitiateTransferRequest,
} from "./api";

export const QUERY_KEYS = {
    getAccount: 'getAccount',
    generatePalmpayAccount: 'generatePalmpayAccount',
    getUserProfile: 'getUserProfile',
    getWalletBalance: 'getWalletBalance',
    getLatestTransactions: 'getLatestTransactions',
    getRecentDataPurchases: 'getRecentDataPurchases',
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
    listPromoBanners: 'listPromoBanners',
    generateWebAuthLink: 'generateWebAuthLink',
    getAnalytics: 'getAnalytics',
    // Guest checkout / Wallet funding
    initiateGuestTransaction: 'initiateGuestTransaction',
    guestTransactionStatus: 'guestTransactionStatus',
    // Education
    listEducationServices: 'listEducationServices',
    verifyEducationMerchant: 'verifyEducationMerchant',
    // Inter-wallet transfer
    lookupTransferRecipient: 'lookupTransferRecipient',
    initiateTransfer: 'initiateTransfer',
    getTransferLimits: 'getTransferLimits',
    getRecentTransferRecipients: 'getRecentTransferRecipients',
} as const

export const useGetAccount = (id?: string) => useQuery({
    queryKey: [QUERY_KEYS.getAccount, id],
    queryFn: () => getAccount(id),
    // Account info should be considered fresh for 30 seconds
    staleTime: 30 * 1000,
    // Always refetch on mount
    refetchOnMount: 'always',
    // Refetch when window regains focus
    refetchOnWindowFocus: true,
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
    // Wallet balance should be considered fresh for only 5 seconds
    staleTime: 5 * 1000,
    // Always refetch on mount
    refetchOnMount: 'always',
    // Always refetch when window regains focus
    refetchOnWindowFocus: 'always',
    // Keep trying to fetch if it fails
    refetchOnReconnect: 'always',
})

export const useGetLatestTransactions = () => useQuery({
    queryKey: [QUERY_KEYS.getLatestTransactions],
    queryFn: getLatestTransactions,
    // Transactions should be considered fresh for only 5 seconds
    staleTime: 5 * 1000,
    // Always refetch on mount
    refetchOnMount: 'always',
    // Always refetch when window regains focus
    refetchOnWindowFocus: 'always',
    // Keep trying to fetch if it fails
    refetchOnReconnect: 'always',
})

export const useGetRecentDataPurchases = () => useQuery({
    queryKey: [QUERY_KEYS.getRecentDataPurchases],
    queryFn: getRecentDataPurchases,
    // Transactions should be considered fresh for 1 minute
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
})

export const useGetTransactions = (limit: number = 30, offset: number = 0) => useQuery({
    queryKey: [QUERY_KEYS.getTransactions, limit, offset],
    queryFn: () => getTransactions(limit, offset),
    // Transactions should be considered fresh for only 10 seconds
    staleTime: 10 * 1000,
    // Always refetch on mount
    refetchOnMount: 'always',
    // Always refetch when window regains focus
    refetchOnWindowFocus: 'always',
})

export const useGetTransaction = (id: string) => useQuery({
    queryKey: [QUERY_KEYS.getTransaction, id],
    queryFn: () => getTransaction(id),
})

export const useProcessTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: [QUERY_KEYS.processTransaction],
        mutationFn: processTransaction,
        onSuccess: ({ data }) => {
            if (data?.type == 'data_bundle' || data?.title?.startsWith('Data')) {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getRecentDataPurchases] })
            }
        }
    })
}

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

export const useListPromoBanners = () => useQuery({
    queryKey: [QUERY_KEYS.listPromoBanners],
    queryFn: listPromoBanners,
});

export const useGenerateWebAuthLink = () => useMutation({
    mutationKey: [QUERY_KEYS.generateWebAuthLink],
    mutationFn: generateWebAuthLink,
});

export const useGetAnalytics = () => useQuery({
    queryKey: [QUERY_KEYS.getAnalytics],
    queryFn: getTransactionAnalytics,
});

// ==============================================
// Guest Checkout / Wallet Funding Hooks
// ==============================================

/**
 * Mutation hook to initiate a guest checkout transaction
 * Used for wallet funding via Monnify
 */
export const useInitiateGuestTransaction = () => useMutation({
    mutationKey: [QUERY_KEYS.initiateGuestTransaction],
    mutationFn: initiateGuestTransaction,
});

/**
 * Query hook to poll guest transaction status
 * Polls every 3 seconds until success/failure
 */
export const useGuestTransactionStatus = (
    reference: string | null,
    options?: { enabled?: boolean }
) => useQuery({
    queryKey: [QUERY_KEYS.guestTransactionStatus, reference],
    queryFn: () => getGuestTransactionStatus(reference!),
    enabled: !!reference && (options?.enabled !== false),
    refetchInterval: (query) => {
        const status = query.state.data?.data?.fulfillment_status;
        // Stop polling once transaction is complete or failed
        if (status === 'success' || status === 'failed') {
            return false;
        }
        // Poll every 3 seconds while pending/processing
        return 3000;
    },
});

// ==============================================
// Education (WAEC/JAMB/DE) Hooks
// ==============================================

/**
 * Query hook to list available education services (grouped by type)
 */
export const useListEducationServices = () => useQuery({
    queryKey: [QUERY_KEYS.listEducationServices],
    queryFn: listEducationServices,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
});

/**
 * Mutation hook to verify education merchant (Profile ID for JAMB/DE)
 */
export const useVerifyEducationMerchant = () => useMutation({
    mutationKey: [QUERY_KEYS.verifyEducationMerchant],
    mutationFn: (request: VerifyEducationMerchantRequest) => verifyEducationMerchant(request),
});

// ==============================================
// Inter-Wallet Transfer Hooks
// ==============================================

/**
 * Query hook to get transfer limits (daily, hourly, min/max amounts)
 */
export const useGetTransferLimits = (enabled?: boolean) => useQuery({
    queryKey: [QUERY_KEYS.getTransferLimits],
    queryFn: getTransferLimits,
    enabled: enabled !== false,
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
    refetchOnMount: 'always',
});

/**
 * Mutation hook to look up a transfer recipient by email/phone/account number
 */
export const useLookupTransferRecipient = () => useMutation({
    mutationKey: [QUERY_KEYS.lookupTransferRecipient],
    mutationFn: (identifier: string) => lookupTransferRecipient(identifier),
});

/**
 * Mutation hook to initiate an inter-wallet transfer
 */
export const useInitiateTransfer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [QUERY_KEYS.initiateTransfer],
        mutationFn: (request: InitiateTransferRequest) => initiateTransfer(request),
        onSuccess: () => {
            // Invalidate relevant queries after successful transfer
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getTransferLimits] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getRecentTransferRecipients] });
        },
    });
};

/**
 * Query hook to get recent transfer recipients
 */
export const useGetRecentTransferRecipients = (limit: number = 5, enabled?: boolean) => useQuery({
    queryKey: [QUERY_KEYS.getRecentTransferRecipients, limit],
    queryFn: () => getRecentTransferRecipients(limit),
    enabled: enabled !== false,
    staleTime: 60 * 1000, // Consider fresh for 1 minute
});