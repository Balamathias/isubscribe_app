import { useMutation } from "@tanstack/react-query";
import { signUp, signIn, signOut, performOAuth } from "./auth";

const QUERY_KEYS = {
    signUp: 'signUp',
    signIn: 'signIn',
    signOut: 'signOut',
    performOAuth: 'performOAuth'
}

export const useSignUp = () => useMutation({
    mutationKey: [QUERY_KEYS.signUp],
    mutationFn: signUp,
})

export const useSignIn = () => useMutation({
    mutationKey: [QUERY_KEYS.signIn],
    mutationFn: ({ email, password }: { email: string; password: string }) => 
        signIn(email, password),
})

export const useSignOut = () => useMutation({
    mutationKey: [QUERY_KEYS.signOut],
    mutationFn: signOut,
})

export const useOAuth = () => useMutation({
    mutationKey: [QUERY_KEYS.performOAuth],
    mutationFn: performOAuth,
})