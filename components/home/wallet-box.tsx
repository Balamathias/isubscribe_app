import { supabase } from '@/lib/supabase'
import { QUERY_KEYS, useGetAccount } from '@/services/account-hooks'
import { Tables } from '@/types/database'
import { formatNigerianNaira } from '@/utils/format-naira'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useSession } from '../session-context'
import FundWalletBottomSheet from './fund-wallet-sheet'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
}

const WalletBox = ({}: Props) => {
  const [showBalance, setShowBalance] = useState(true)
  const [showBonus, setShowBonus] = useState(true)
  const [showFundWalletBottomSheet, setShowFundWalletBottomSheet] = useState(false);
  const [localWalletBalance, setLocalWalletBalance] = useState(0)

  const queryClient = useQueryClient()

  const { user, walletBalance: wallet, loadingBalance: isPending } = useSession()
  const { data: account } = useGetAccount()

  useEffect(() => {
    if (!user) return

    const walletChannel = supabase.channel('wallet-update-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'wallet', filter: `user=eq.${user?.id}` },
        (payload) => {
          if (payload.new) {
            const response = payload?.new as Tables<'wallet'>
            setLocalWalletBalance(response.balance ?? 0)
            
            if (response.balance! > wallet?.balance!) {
              Toast.show({
                type: 'info',
                text1: 'Wallet funded successfully.'
              })
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }

            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] })
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getTransactions] })
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(walletChannel) }
  }, [user?.id, wallet?.balance])

  const toggleBalance = () => setShowBalance(!showBalance)
  const toggleBonus = () => setShowBonus(!showBonus)

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
  };

  return (
    <LinearGradient
      colors={['#7B2FF2', '#8667f7', '#F357A8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={"rounded-2xl p-5 my-2 flex-row justify-between items-start min-h-[120px] overflow-hidden mt-6 shadow-sm"}
    >
      <View className="flex-1">
        <Text className="text-white/80 text-xs mb-1">Wallet Balance</Text>
        <View className="flex-row items-center mb-4">
          {isPending ? (
            <ActivityIndicator size={13} color="#fff" style={{ marginRight: 2}} />
          ) : (
            <Text className="text-white font-bold text-2xl mr-1">{formatNumber(user ? (localWalletBalance || wallet?.balance || 0) : 0)}</Text>
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
            <Text className="text-white font-bold text-xl mr-1">{formatBonus(user ? wallet?.data_bonus! : '0.00 MB')}</Text>
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
                    className="rounded-full px-4 py-2 flex-row items-center self-end opacity-60"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.18)',
                    }}
                    disabled
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