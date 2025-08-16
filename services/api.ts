import { supabase } from "@/lib/supabase";
import { microservice } from "./ai.ms";
import { PaginatedResponse, Response } from "@/types/ai-ms.generics";
import { Tables } from "@/types/database";

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
            const { data, status } = await microservice.post<Response<any>>('https://isubscribe-ai-microservice.onrender.com/api/v1/palmpay/create_virtual_account/', {
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

export const generateReservedAccount = async (params: { bvn?: string, nin?: string }): Promise<Response<Tables<'account'> | null>> => {
    try {
        const { data, status } = await microservice.post('/mobile/reserved-account/', params)
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

export const getTransactions = async (limit: number = 30, offset: number = 0): Promise<PaginatedResponse<Tables<'history'>[]>> => {
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
            data: [],
            error: {
                message: error?.response?.data?.message || error?.message
            },
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
            count: 0,
            next: '',
            previous: ''
        }
    }
}

export const getTransaction = async (id: string): Promise<Response<Tables<'history'>>> => {
    try {
        const { data, status } = await microservice.get(`/mobile/transactions/${id}/`)
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

/**
 * Processes a transaction based on the provided transaction data.
 * @param transactionData - The data to process the transaction, typically includes details like amount, type, and other necessary information. A differentiating field is the `channel` field which can either be `airtime`, `data_bundle`, `electricity`, `tv`, or `education`.
 * @returns A promise that resolves to a Response object containing the processed transaction data or an error message.
 */
export const processTransaction = async (transactionData: Record<string, any>): Promise<Response<Tables<'history'>>> => {
    try {
        const { data, status } = await microservice.post('/mobile/process-transactions/', { ...transactionData, source: 'mobile' })
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

export const getBeneficiaries = async (limit: number = 5): Promise<Response<Tables<'beneficiaries'>[]>> => {
    try {
        const { data, status } = await microservice.get('/mobile/beneficiaries/', {
            params: {
                limit
            }
        })
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


export interface SuperPlansMB extends Tables<'n3t'> {
    data_bonus: string,
    data_bonus_price: string
}

export interface BestPlansMB extends Tables<'gsub'> {
    data_bonus: string,
    data_bonus_price: string
}

export interface RegularPlansMB extends Tables<'vtpass'> {
    data_bonus: string,
    data_bonus_price: string
}

export interface ListDataPlans {
    Super: SuperPlansMB[],
    Best: BestPlansMB[],
    Regular: RegularPlansMB[]
}

export const listDataPlans = async (): Promise<Response<ListDataPlans | null>> => {
    try {
        const { data, status } = await microservice.get('/mobile/list-plans/')
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

export const listElectricityServices = async (): Promise<Response<Tables<'electricity'>[] | null>> => {
    try {
        const { data, status } = await microservice.get('/mobile/list-electricity/')
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

export interface TVData {
    dstv: Tables<'tv'>[];
    startimes: Tables<'tv'>[];
    gotv: Tables<'tv'>[];
    showmax: Tables<'tv'>[];
}

export const listTVServices = async (): Promise<Response<TVData | null>> => {
    try {
        const { data, status } = await microservice.get('/mobile/list-tv/')
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

export interface AppConfig {
    app_name: string;
    app_version: string;
    support_email: string;
    support_phone: string;
    jamb_price: number;
    waec_price: number;
    electricity_commission_rate: number;
    update_available: boolean;
    update_url: string;
    update_message: string;
}

export const getAppConfig = async (): Promise<Response<AppConfig | null>> => {
    try {
        const { data, status } = await microservice.get('/mobile/app-config/')
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

export interface VerifyMerchantResponse {
    Customer_Name: string;
    Address: string;
    MeterNumber: string;
    Min_Purchase_Amount: number;
    Outstanding: number;
    Customer_Arrears: string | null;
    Meter_Type: string;
    WrongBillersCode: boolean;
    commission_details: {
        amount: string | null;
        rate: string;
        rate_type: string;
        computation_type: string;
    };
}

export interface VerifyMerchantRequest {
    type: 'prepaid' | 'postpaid';
    billersCode: string;
    serviceID: string;
}

export const verifyMerchant = async (transactionData: VerifyMerchantRequest): Promise<Response<VerifyMerchantResponse | null>> => {
    try {
        const { data, status } = await microservice.post('/mobile/verify-merchant/', transactionData)
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

export const verifyPin = async (transactionData: Record<string, any>): Promise<Response<{is_valid: boolean, pin_set?: boolean} | null>> => {
    try {
        const { data, status } = await microservice.post('/mobile/verify-pin/', transactionData)
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

export const verifyPhone = async (phone: string): Promise<Response<{network: string} | null>> => {
    try {
        const { data, status } = await microservice.post('/mobile/verify-phone/', { phone })
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

export const createRating = async (_req_data: { comment: string, rating: number }): Promise<Response<Tables<'ratings'> | null>> => {
    try {
        const { data, status } = await microservice.post('/mobile/ratings/', { ..._req_data })
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

export const listRatings = async (limit?: number, offset: number = 0): Promise<Response<(Tables<'ratings'> & { profile: Tables<'profile'> })[] | null>> => {
    try {
        const { data, status } = await microservice.get('/mobile/ratings/', {
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

export const deleteAccount = async (): Promise<Response<any | null>> => {
    try {
        const { data, status } = await microservice.delete('/mobile/delete-account/')
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

export const getNotifications = async () => {
    const { data, error } = await supabase.from('announcements').select('*').eq('published', true).order('created_at', { ascending: false })

    if (error) throw error

    return { data }
}

export const requestPinResetOTP = async (): Promise<Response<{ message: string } | null>> => {
    try {
        const { data, status } = await microservice.post('/pin-reset/request/')
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

export const verifyResetPinOTP = async (params: { otp: string }): Promise<Response<{ message: string } | null>> => {
    try {
        const { data, status } = await microservice.post('/pin-reset/verify-otp/', params)
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

export const resetPinWithOTP = async (params: { otp: string, new_pin: string, requires_otp?: boolean }): Promise<Response<{ message: string } | null>> => {
    try {
        const { data, status } = await microservice.post('/pin-reset/reset/', params)
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

export interface AdminCreatePushTokenData {
    user_id: string;
    token: string;
    device_type?: 'ios' | 'android' | 'web';
    active?: boolean;
}

export const createPushToken = async (data: AdminCreatePushTokenData): Promise<Response<Tables<'push_tokens'> | null>> => {
    try {
        const { data: response, status } = await microservice.post('/mobile/push-tokens/', data)
        return response
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

export const updateProfile = async (profileData: Partial<Tables<'profile'>>): Promise<Response<Tables<'profile'> | null>> => {
    try {
        const { data, status } = await microservice.put('/mobile/profile/', profileData)
        return data
    } catch (error: any) {
        console.error('Error updating profile:', error);
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

export const getUserProfile = async (): Promise<Response<Tables<'profile'> | null>> => {
    try {
        const { data, status } = await microservice.get('/mobile/profile/')
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