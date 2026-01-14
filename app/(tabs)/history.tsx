import React, { useState } from 'react'
import { View, TouchableOpacity, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import ListTransactions from '../transactions/list-transactions'
import TransactionAnalytics from '@/components/history/transaction-analytics'
import { useThemedColors } from '@/hooks/useThemedColors'
import { LinearGradient } from 'expo-linear-gradient'

const History = () => {
  const { colors, theme } = useThemedColors()
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list')

  return (
    <View className={'flex-1 bg-background' + ` ${theme}`}>
      {/* Custom Header */}
      <SafeAreaView edges={['top']} className={`${theme} bg-background`}>
        <View className="px-4 pt-2 pb-4">
          {/* Title Row */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-foreground">Transactions</Text>
            <TouchableOpacity
              onPress={() => router.push(`/help`)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.muted + '50' }}
            >
              <Ionicons name="headset-outline" color={colors.foreground} size={22} />
            </TouchableOpacity>
          </View>

          {/* Polished Tab Switcher */}
          <View
            className="flex-row p-1.5 rounded-2xl"
            style={{ backgroundColor: colors.muted + '40' }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('list')}
              activeOpacity={0.7}
              className="flex-1 overflow-hidden rounded-xl"
            >
              {activeTab === 'list' ? (
                <LinearGradient
                  colors={[colors.primary, '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 12,
                  }}
                >
                  <Ionicons name="receipt-outline" size={18} color="#fff" />
                  <Text className="font-semibold text-sm text-white">History</Text>
                </LinearGradient>
              ) : (
                <View className="py-3 flex-row items-center justify-center gap-x-2">
                  <Ionicons name="receipt-outline" size={18} color={colors.mutedForeground} />
                  <Text style={{ color: colors.mutedForeground }} className="font-semibold text-sm">
                    History
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('analytics')}
              activeOpacity={0.7}
              className="flex-1 overflow-hidden rounded-xl"
            >
              {activeTab === 'analytics' ? (
                <LinearGradient
                  colors={[colors.primary, '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 12,
                  }}
                >
                  <Ionicons name="pie-chart-outline" size={18} color="#fff" />
                  <Text className="font-semibold text-sm text-white">Analytics</Text>
                </LinearGradient>
              ) : (
                <View className="py-3 flex-row items-center justify-center gap-x-2">
                  <Ionicons name="pie-chart-outline" size={18} color={colors.mutedForeground} />
                  <Text style={{ color: colors.mutedForeground }} className="font-semibold text-sm">
                    Analytics
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Content */}
      <View className="flex-1">
        {activeTab === 'list' ? (
          <ListTransactions />
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <TransactionAnalytics />
          </ScrollView>
        )}
      </View>
    </View>
  )
}

export default History
