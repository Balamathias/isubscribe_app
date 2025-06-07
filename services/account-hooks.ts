import { useMutation, useQuery } from "@tanstack/react-query";
import { getAccount, generatePalmpayAccount, getUserProfile } from "./accounts";

const QUERY_KEYS = {
    getAccount: 'getAccount',
    generatePalmpayAccount: 'generatePalmpayAccount',
    getUserProfile: 'getUserProfile'
}

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
