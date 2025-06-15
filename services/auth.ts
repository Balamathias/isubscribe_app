import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '@/lib/supabase'

WebBrowser.maybeCompleteAuthSession() // required for web only
const redirectTo = makeRedirectUri()

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url)

  if (errorCode) throw new Error(errorCode)
  const { access_token, refresh_token } = params

  if (!access_token) return

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  })
  if (error) throw error
  return data.session
}

export const performOAuth = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })
  if (error) throw error

  const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo)

  if (res.type === 'success') {
    const { url } = res
    await createSessionFromUrl(url)
  }
}

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
}

export const signUp = async ({ email, password, metadata={} }: { email: string, password: string, metadata?: Record<string, string> }) => {

    const { data: _user, error: _error } = await supabase.from('profile').select('id, onboarded').eq('email', email).single()

    if (_user && _user?.id) {
        if (!_user?.onboarded) {
            await supabase.auth.resend({ email, type: "signup" })
            return { message: 'Account created successfully.', status: 200, statusText: 'OK', data: null}
        }
        return { error: { message: `User with this email - ${email} already exists.` } }
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone: metadata?.phone,
        options: {
            data: metadata,
        }
    })

    console.error(error);

    if (error) return { error: { message: `An unknown error occurred, please try again` }}

    return { message: 'Account created successfully.', status: 200, statusText: 'OK', data: data}
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

export const validateResetPasswordOTP = async (token: string, email: string) => {

  const { data, error } = await supabase.auth.verifyOtp({token, email, type: 'recovery'})

  console.error(error, token, email)

  
  if (error || !data) return { data: null, error: { message: error?.message } }
  
  await supabase.auth.setSession({ access_token: data?.session?.access_token!, refresh_token: data?.session?.refresh_token! })

  return { data, error: null }
}

export async function verifyOtp(payload: { email: string, otp: string}) {

  const { data, error } = await supabase.auth.verifyOtp({
    email: payload?.email,
    token: payload?.otp,
    type: 'email'
  })

  if (error) {
    throw error
  }

  return { data: data || null, error: error || null }
}



export async function resendOtp(payload: { email: string }) {

  const { error, data  } = await supabase.auth.resend({
    type: 'signup',
    email: payload?.email,
   
  })

  if (error) {
    throw error
  }

  return { data: data || null, error: error || null }
}



