import { supabase } from '@/lib/supabase'
import { QUERY_KEYS, useGetAccount } from '@/services/api-hooks'
import { Tables } from '@/types/database'
import { formatNigerianNaira } from '@/utils/format-naira'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, AppState, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useSession } from '../session-context'
import FundWalletBottomSheet from './fund-wallet-sheet'

interface Props {
}

// AsyncStorage keys for wallet preferences
const STORAGE_KEYS = {
  SHOW_BALANCE: '@wallet_show_balance',
  SHOW_BONUS: '@wallet_show_bonus',
}

const WalletBox = ({}: Props) => {
  const [showBalance, setShowBalance] = useState(true)
  const [showBonus, setShowBonus] = useState(true)
  const [showFundWalletBottomSheet, setShowFundWalletBottomSheet] = useState(false);
  const [localWalletBalance, setLocalWalletBalance] = useState<number | null>(null)

  const queryClient = useQueryClient()

  const { user, walletBalance: wallet, loadingBalance: isPending, refetchBalance, refetchProfile } = useSession()
  const { data: account } = useGetAccount()

  // Load saved preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedShowBalance, savedShowBonus] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SHOW_BALANCE),
          AsyncStorage.getItem(STORAGE_KEYS.SHOW_BONUS),
        ])

        if (savedShowBalance !== null) {
          setShowBalance(JSON.parse(savedShowBalance))
        }
        if (savedShowBonus !== null) {
          setShowBonus(JSON.parse(savedShowBonus))
        }
      } catch (error) {
        console.error('Error loading wallet preferences:', error)
      }
    }

    loadPreferences()

    refetchBalance()
    refetchProfile()
  }, [])

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const lastBalanceRef = useRef<number>(0)

  useEffect(() => {
    if (wallet?.balance !== undefined && wallet?.balance !== null) {
      setLocalWalletBalance(wallet.balance)
      // Also update the lastBalanceRef to ensure haptic feedback works correctly
      lastBalanceRef.current = Number(wallet.balance)
    }
  }, [wallet?.balance])

  useEffect(() => {
    if (!user?.id) return

    try {
      channelRef.current?.unsubscribe()

      // Update lastBalanceRef whenever wallet balance changes
      lastBalanceRef.current = Number(wallet?.balance || 0)

      const channel = supabase
        .channel(`@isubscribe:wallet-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wallet', filter: `user=eq.${user.id}` },
          (payload) => {
            try {
              const data = payload?.new as Tables<'wallet'> | null
              if (!data) return

              const newBalance = Number(data.balance || 0)
              setLocalWalletBalance(newBalance)

              if (newBalance > lastBalanceRef.current) {
                // Toast.show({ type: 'info', text1: 'Wallet funded successfully.' })
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
              }
              lastBalanceRef.current = newBalance

              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] })
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] })
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getTransactions] })
            } catch (error) {
              console.error('Error processing wallet update:', error)
            }
          }
        )

      channel.subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Wallet realtime channel error; retrying subscribe')
          setTimeout(() => channel.subscribe(), 1000)
        }
      })

      channelRef.current = channel

      return () => {
        try {
          channelRef.current?.unsubscribe()
          channelRef.current = null
        } catch (error) {
          console.error('Error cleaning up wallet channel:', error)
        }
      }
    } catch (error) {
      console.error('Error setting up wallet channel:', error)
    }
  }, [user?.id])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && user?.id) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] })
        refetchBalance()
      }
    })
    return () => {
      // @ts-ignore RN types compat
      sub?.remove?.()
    }
  }, [user?.id])

  // Add periodic refresh every 30 seconds when app is active
  useEffect(() => {
    if (!user?.id) return

    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        refetchBalance()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(intervalId)
  }, [user?.id, refetchBalance])

  const toggleBalance = async () => {
    const newValue = !showBalance
    setShowBalance(newValue)
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SHOW_BALANCE, JSON.stringify(newValue))
    } catch (error) {
      console.error('Error saving show balance preference:', error)
    }
  }
  
  const toggleBonus = async () => {
    const newValue = !showBonus
    setShowBonus(newValue)
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SHOW_BONUS, JSON.stringify(newValue))
    } catch (error) {
      console.error('Error saving show bonus preference:', error)
    }
  }

  const formatNumber = (value: number) => {
    if (showBalance) {
      return formatNigerianNaira(value)
    }
    return '••••••'
  }

  const formatBonus = (value: string) => {
    if (!showBonus) return '••••••'
    return value
  }

  const handleFundWalletPress = () => {
    setShowFundWalletBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setShowFundWalletBottomSheet(false);
    // Refresh balance when closing the fund wallet sheet
    refetchBalance();
  };

  return (
    <LinearGradient
      colors={['#740faa', '#a13ae1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={"rounded-2xl p-5  flex-row justify-between items-start min-h-[120px] overflow-hidden shadow-sm"}
    >
      <View className="flex-1">
        <Text className="text-white/80 text-xs mb-1">Wallet Balance</Text>
        <View className="flex-row items-center mb-4">
          {isPending ? (
            <ActivityIndicator size={13} color="#fff" style={{ marginRight: 2}} />
          ) : (
            <Text className="text-white font-bold text-2xl mr-1">{formatNumber(user ? (localWalletBalance !== null ? localWalletBalance : (wallet?.balance || 0)) : 0)}</Text>
          )}
          <TouchableOpacity onPress={toggleBalance}>
            <Ionicons 
              name={showBalance ? "eye-outline" : "eye-off-outline"} 
              size={18} 
              color="#fff" 
              style={{ opacity: 0.7 }} 
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="bg-white rounded-full px-4 py-2 flex-row items-center self-start"
          activeOpacity={0.6}
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}
          onPress={
            user 
              ? account?.data?.palmpay_account_number 
                ? handleFundWalletPress 
                : () => router.push('/accounts')
              : () => router.push('/auth/login')
          }
        >
          <Ionicons name={user ? "add-outline" : "log-in-outline"} size={18} color="#7B2FF2" style={{ marginRight: 2 }} />
          <Text className="text-[#7B2FF2] font-semibold text-base">{user ? 'Fund Wallet' : 'Login'}</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-end justify-between">
        <Text className="text-white/80 text-xs mb-1">Data Bonus</Text>
        <View className="flex-row items-center mb-4">
          {isPending ? (
            <ActivityIndicator size={13} color="#fff" style={{marginRight: 2}}/>
          ) : (
            <Text className="text-white font-bold text-xl mr-1">{formatBonus(user ? wallet?.data_bonus ?? '0.00 MB' : '0.00 MB')}</Text>
          )}
          <TouchableOpacity onPress={toggleBonus}>
            <Ionicons 
              name={showBonus ? "eye-outline" : "eye-off-outline"} 
              size={18} 
              color="#fff" 
              style={{ opacity: 0.7 }} 
            />
          </TouchableOpacity>
        </View>

        {
            user ? (
                <TouchableOpacity
                    className="rounded-full px-4 py-2 flex-row items-center self-end"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.18)',
                    }}
                    disabled={!wallet || !wallet?.balance}
                    onPress={() => router.push(`/services/data?use_bonus=true`)}
                    >
                    <Text className="text-white font-semibold text-base">Use bonus</Text>
                    <Ionicons name="chevron-forward-outline" size={18} color="#fff" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
            ): (
                <Link 
                    href={`/auth/register`}
                    className='self-end mt-2 text-white font-medium'
                >
                    Register
                </Link>
            )
        }
      </View>

      <FundWalletBottomSheet isVisible={showFundWalletBottomSheet} onClose={handleCloseBottomSheet} />
    </LinearGradient>
  )
}

export default WalletBox