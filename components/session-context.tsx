import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Text } from 'react-native'
import SplashScreen from './splash-screen'
import { useGetLatestTransactions, useGetWalletBalance } from '@/services/account-hooks'
import { WalletBalance } from '@/services/accounts'

interface SessionContextType {
  session: Session | null
  user: User | null
  isLoading: boolean,
  walletBalance: WalletBalance | null,
  refetchBalance: () => void,
  loadingBalance: boolean,
  latestTransactions: any[] | null,
  refetchTransactions: () => void,
  loadingTransactions: boolean,
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
})

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: walletBalance, isPending: loadingBalance, refetch: refetchBalance } = useGetWalletBalance()
  const { data: latestTransactions, isPending: loadingTransactions, refetch: refetchTransactions } = useGetLatestTransactions()

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
