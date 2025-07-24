import { supabase } from '@/lib/supabase'
import { AppConfig, ListDataPlans, TVData, WalletBalance } from '@/services/api'
import { useGetAppConfig, useGetBeneficiaries, useGetLatestTransactions, useGetUserProfile, useGetWalletBalance, useListDataPlans, useListElectricityServices, useListTVServices } from '@/services/api-hooks'
import { Tables } from '@/types/database'
import { Session, User } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import SplashScreen from './splash-screen'

interface SessionContextType {
  session: Session | null
  user: User | null
  isLoading: boolean,
  walletBalance: WalletBalance | null,
  refetchBalance: () => void,
  loadingBalance: boolean,
  latestTransactions: Tables<'history'>[] | null,
  refetchTransactions: () => void,
  loadingTransactions: boolean,
  dataPlans: ListDataPlans | null,
  refetchDataPlans: () => void,
  loadingDataPlans: boolean,
  profile: Tables<'profile'> | null,
  refetchProfile: () => void,
  loadingProfile: boolean,
  beneficiaries?: Tables<'beneficiaries'>[] | null,
  refetchBeneficiaries?: () => void,
  loadingBeneficiaries?: boolean,
  electricityServices?: Tables<'electricity'>[] | null,
  refetchElectricityServices?: () => void,
  loadingElectricityServices?: boolean,
  tvServices?: TVData | null,
  refetchTVServices?: () => void,
  loadingTVServices?: boolean,
  appConfig?: AppConfig | null,
  refetchAppConfig?: () => void,
  loadingAppConfig?: boolean,
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  isLoading: true,
  walletBalance: null,
  refetchBalance: () => {},
  loadingBalance: false,
  latestTransactions: null,
  refetchTransactions: () => {},
  loadingTransactions: false,
  dataPlans: null,
  refetchDataPlans: () => {},
  loadingDataPlans: false,
  profile: null,
  refetchProfile: () => {},
  loadingProfile: false,
  beneficiaries: null,
  refetchBeneficiaries: () => {},
  loadingBeneficiaries: false,
  electricityServices: null,
  refetchElectricityServices: () => {},
  loadingElectricityServices: false,
  tvServices: null,
  refetchTVServices: () => {},
  loadingTVServices: false,
  appConfig: null,
  refetchAppConfig: () => {},
  loadingAppConfig: false,
})

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const shouldFetchUserData = !!user;
  
  const { data: walletBalance, isPending: loadingBalance, refetch: refetchBalance } = useGetWalletBalance()
  const { data: latestTransactions, isPending: loadingTransactions, refetch: refetchTransactions } = useGetLatestTransactions()
  
  const { data: dataPlans, isPending: loadingDataPlans, refetch: refetchDataPlans } = useListDataPlans()
  const { data: profile, isPending: loadingProfile, refetch: refetchProfile } = useGetUserProfile()
  const { data: beneficiaries, isPending: loadingBeneficiaries, refetch: refetchBeneficiaries } = useGetBeneficiaries()
  const { data: electricityServices, isPending: loadingElectricityServices, refetch: refetchElectricityServices } = useListElectricityServices()
  const { data: tvServices, isPending: loadingTVServices, refetch: refetchTVServices } = useListTVServices()
  const { data: appConfig, isPending: loadingAppConfig, refetch: refetchAppConfig } = useGetAppConfig()

  const memoizedRefetchBalance = useCallback(() => {
    if (shouldFetchUserData) refetchBalance();
  }, [refetchBalance, shouldFetchUserData]);

  const memoizedRefetchTransactions = useCallback(() => {
    if (shouldFetchUserData) refetchTransactions();
  }, [refetchTransactions, shouldFetchUserData]);

  const memoizedRefetchDataPlans = useCallback(() => {
    refetchDataPlans();
  }, [refetchDataPlans]);

  const memoizedRefetchProfile = useCallback(() => {
    if (shouldFetchUserData) refetchProfile();
  }, [refetchProfile, shouldFetchUserData]);

  const memoizedRefetchBeneficiaries = useCallback(() => {
    if (shouldFetchUserData) refetchBeneficiaries();
  }, [refetchBeneficiaries, shouldFetchUserData]);

  const memoizedRefetchElectricityServices = useCallback(() => {
    refetchElectricityServices();
  }, [refetchElectricityServices]);

  const memoizedRefetchTVServices = useCallback(() => {
    refetchTVServices();
  }, [refetchTVServices]);

  const memoizedRefetchAppConfig = useCallback(() => {
    refetchAppConfig();
  }, [refetchAppConfig]);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (error) {
        console.error('Error initializing session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    session, 
    user, 
    isLoading,
    walletBalance: walletBalance?.data || null, 
    refetchBalance: memoizedRefetchBalance, 
    loadingBalance,
    latestTransactions: latestTransactions?.data || null, 
    refetchTransactions: memoizedRefetchTransactions, 
    loadingTransactions,
    dataPlans: dataPlans?.data || null, 
    refetchDataPlans: memoizedRefetchDataPlans, 
    loadingDataPlans,
    profile: profile?.data || null, 
    refetchProfile: memoizedRefetchProfile, 
    loadingProfile,
    beneficiaries: beneficiaries?.data || null, 
    refetchBeneficiaries: memoizedRefetchBeneficiaries, 
    loadingBeneficiaries,
    electricityServices: electricityServices?.data || null, 
    refetchElectricityServices: memoizedRefetchElectricityServices, 
    loadingElectricityServices,
    tvServices: tvServices?.data || null, 
    refetchTVServices: memoizedRefetchTVServices, 
    loadingTVServices,
    appConfig: appConfig?.data || null, 
    refetchAppConfig: memoizedRefetchAppConfig, 
    loadingAppConfig
  }), [
    session,
    user,
    isLoading,
    walletBalance?.data,
    memoizedRefetchBalance,
    loadingBalance,
    latestTransactions?.data,
    memoizedRefetchTransactions,
    loadingTransactions,
    dataPlans?.data,
    memoizedRefetchDataPlans,
    loadingDataPlans,
    profile?.data,
    memoizedRefetchProfile,
    loadingProfile,
    beneficiaries?.data,
    memoizedRefetchBeneficiaries,
    loadingBeneficiaries,
    electricityServices?.data,
    memoizedRefetchElectricityServices,
    loadingElectricityServices,
    tvServices?.data,
    memoizedRefetchTVServices,
    loadingTVServices,
    appConfig?.data,
    memoizedRefetchAppConfig,
    loadingAppConfig
  ]);

  if (isLoading) return <SplashScreen />

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export const useAuth = () => {
  const { session, user, isLoading } = useSession()
  return { session, user, isLoading }
}
