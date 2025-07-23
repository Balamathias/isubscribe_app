import { useMutation } from "@tanstack/react-query";
import { signUp, signIn, signOut, performOAuth, validateResetPasswordOTP, verifyOtp, resendOtp } from "./auth";

const QUERY_KEYS = {
    signUp: 'signUp',
    signIn: 'signIn',
    signOut: 'signOut',
    performOAuth: 'performOAuth',
    validateResetPasswordOTP: 'validateResetPasswordOTP',
    verifyOtp: 'verifyOtp',
    resendOtp: 'resendOtp',
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

export const useValidateResetPasswordOTP = () => useMutation({
    mutationKey: [QUERY_KEYS.validateResetPasswordOTP],
    mutationFn: ({ token, email }: { token: string; email: string }) => 
        validateResetPasswordOTP(token, email),
})

export const useVerifyOtp = () => useMutation({
    mutationKey: [QUERY_KEYS.verifyOtp],
    mutationFn: verifyOtp,
})

export const useResendOtp = () => useMutation({
    mutationKey: [QUERY_KEYS.resendOtp],
    mutationFn: resendOtp,
})