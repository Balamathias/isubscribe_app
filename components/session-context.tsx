import { supabase } from '@/lib/supabase'
import { ListDataPlans, WalletBalance } from '@/services/api'
import { useGetBeneficiaries, useGetLatestTransactions, useGetUserProfile, useGetWalletBalance, useListDataPlans } from '@/services/api-hooks'
import { Tables } from '@/types/database'
import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
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
})

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: walletBalance, isPending: loadingBalance, refetch: refetchBalance } = useGetWalletBalance()
  const { data: latestTransactions, isPending: loadingTransactions, refetch: refetchTransactions } = useGetLatestTransactions()
  const { data: dataPlans, isPending: loadingDataPlans, refetch: refetchDataPlans } = useListDataPlans()
  const { data: profile, isPending: loadingProfile, refetch: refetchProfile } = useGetUserProfile()
  const { data: beneficiaries, isPending: loadingBeneficiaries, refetch: refetchBeneficiaries } = useGetBeneficiaries()

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

  if (isLoading || loadingBalance || loadingTransactions) return <SplashScreen />

  return (
    <SessionContext.Provider 
      value={{ 
        session, user, isLoading,
        walletBalance: walletBalance?.data || null, refetchBalance, loadingBalance,
        latestTransactions: latestTransactions?.data || null, refetchTransactions, loadingTransactions,
        dataPlans: dataPlans?.data || null, refetchDataPlans, loadingDataPlans,
        profile: profile?.data || null, refetchProfile, loadingProfile,
        beneficiaries: beneficiaries?.data || null, refetchBeneficiaries, loadingBeneficiaries
      }}
    >
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
