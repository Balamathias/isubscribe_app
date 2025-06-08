import { supabase } from "@/lib/supabase";
import { microservice } from "./ai.ms";
import { Response } from "@/types/ai-ms.generics";
import { Tables } from "@/types/database";


export const getUserProfile = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
        throw error
    }

    if (!user) {
        throw new Error(`User not found`)
    }

    const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .eq('id', user?.id)
        .single()

    if (profileError) {
        throw profileError
    }

    return { data: profile, error: null }
}

export const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
        throw error
    }

    return { data }
}

export const getAccount = async (id?: string) => {
    const { data: { user } } = await getCurrentUser()
    const { data, error } = await supabase.from('account').select('*').eq('user', id ?? user?.id!).single()

    if (error) return { data, error }

    return { data, error }
}

export const generatePalmpayAccount = async () => {
    const { data: user, error: userError } = await getUserProfile()

    if (!user) {
        return { data: null, error: {message: 'User not found'} };
    }

    const { data: account } = await getAccount()

    if (!account || !account?.palmpay_account_number) {
        try {
            const { data, status } = await microservice.post<Response<any>>('/palmpay/create_virtual_account/', {
                email: user.email || '',
                customer_name: user?.full_name || '',
            })

            console.log(data)

            if (status === 201) {
                const req = data

                const { data: accountData, error } = await supabase.from('account').upsert({
                    id: account?.id,
                    palmpay_account_number: req.data.virtual_account_no,
                    palmpay_account_name: req.data.virtual_account_name,
                    metadata: {
                        palmpay: req.data
                    },
                    user: user.id,
                    updated_at: new Date().toISOString(),
                }).select().single()

                if (error) {
                    console.log(`Error`, error)
                    return { data: accountData, error }
                }

                return { data: accountData, error: null }
            } else {
                return { 
                    data: null, 
                    error: { message: `Palmpay account creation failed with status: ${status}` }
                }
            }
        } catch (error: any) {
            console.error('Error creating Palmpay account:', error);
            return {
                data: null,
                error: {
                    message: error?.response?.data?.message || error?.message || 'Failed to create Palmpay account'
                }
            }
        }
    } else {
        return { data: null, error: { message: 'Palmpay account already exists, please refresh.' } }
    }
}

export interface WalletBalance {
    balance: number,
    cashback_balance: number,
    data_bonus: string,
}

export const getWalletBalance = async (): Promise<Response<WalletBalance | null>> => {
    try {
        const { data, status } = await microservice.get('/mobile/wallets/')
        return data
    } catch (error: any) {
        return {
            data: null,
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

export const getLatestTransactions = async (): Promise<Response<Tables<'history'>[]>> => {
    try {
        const { data, status } = await microservice.get('/mobile/transactions/latest/')
        return data
    } catch (error: any) {
        return {
            data: [],
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

export const getTransactions = async (limit: number = 30, offset: number = 0): Promise<Response<Tables<'wallet'>[]>> => {
    try {
        const { data, status } = await microservice.get('/mobile/transactions/', {
            params: {
                limit,
                offset
            }
        })
        return data
    } catch (error: any) {
        return {
            data: null,
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

export const processTransaction = async (transactionData: Record<string, any>): Promise<Response<Tables<'history'>>> => {
    try {
        const { data, status } = await microservice.post('/mobile/process-transactions/', transactionData)
        console.log('DATAAAAAAAA', data)
        return data
    } catch (error: any) {
        return {
            data: null,
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message
        }
    }
}

