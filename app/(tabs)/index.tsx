import Header from "@/components/home/header";
import QuickActions from "@/components/home/quick-actions";
import RecentTransactions from "@/components/home/recent-transactions";
import SocialHandles from "@/components/home/social-handles";
import WalletBox from "@/components/home/wallet-box";
import RatingsDisplayModal from "@/components/ratings/ratings-display-modal";
import { useSession } from "@/components/session-context";
import { COLORS } from "@/constants/colors";
import { useThemedColors } from "@/hooks/useThemedColors";
import { getGreeting } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";


export default function Index() {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  const { refetchBalance, loadingBalance, refetchTransactions, loadingTransactions, profile, user } = useSession()
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const colors = useThemedColors().colors
  
  const getUserInitials = () => user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split(`@`)[0]

  const handleRefresh = useCallback(() => {
    refetchTransactions()
    refetchBalance()
  }, [refetchTransactions, refetchBalance])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  return (
    <>
      <ScrollView
        className={`${theme} flex-1 bg-background/50 dark:bg-background p-4 py-2 min-h-full`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingBalance || loadingTransactions}
            onRefresh={handleRefresh}
            colors={[COLORS.light.primary]}
            style={{ backgroundColor: 'transparent' }}
          />
        }
      >
        <Header />

        <View className="flex flex-col gap-y-3 pb-8">
          <View className="flex flex-col">
            <View className="flex flex-row items-center">
              <Text className="text-lg text-muted-foreground">{getGreeting()}, </Text>
              <Text className="text-lg font-medium text-primary">{getUserInitials() ? getUserInitials() : 'Guest'}.</Text>
            </View>
            <Text className="text-sm text-muted-foreground mt-1">What would you like to subscribe today?</Text>
          </View>

          <WalletBox />

          <QuickActions />

          <RecentTransactions />

          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowRatingsModal(true)} className="bg-card dark:bg-secondary rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="person" size={20} color="#FFD700" />
                <Text className="text-foreground font-bold text-lg ml-2">
                  Customer Reviews
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowRatingsModal(true)}
                className="flex-row items-center"
              >
                <Text className="text-primary font-semibold text-sm mr-1">
                  View All
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text className="text-muted-foreground text-sm">
              See what our customers are saying about their experience
            </Text>
          </TouchableOpacity>

          <SocialHandles />
        </View>
      </ScrollView>

      <RatingsDisplayModal
        isVisible={showRatingsModal}
        onClose={() => setShowRatingsModal(false)}
      />
    </>
  );
}
