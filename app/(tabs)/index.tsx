import Header from "@/components/home/header";
import QuickActions from "@/components/home/quick-actions";
import RecentTransactions from "@/components/home/recent-transactions";
import SocialHandles from "@/components/home/social-handles";
import WalletBox from "@/components/home/wallet-box";
import RatingsDisplayModal from "@/components/ratings/ratings-display-modal";
import { useSession } from "@/components/session-context";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function Index() {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  const { refetchBalance, loadingBalance, refetchTransactions, loadingTransactions, profile } = useSession()
  const [showRatingsModal, setShowRatingsModal] = useState(false);

  const handleRefresh = () => {
    refetchTransactions()
    refetchBalance()
  }

  useEffect(() => {
    handleRefresh()

  }, [handleRefresh])

  return (
    <>
      <ScrollView
        className={`${theme} flex-1 bg-background/50 dark:bg-background p-4 min-h-full`}
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

        <View className="flex flex-col gap-y-4 pb-8">
          <WalletBox />

          <QuickActions />

          <RecentTransactions />

          <View className="bg-card rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#FFD700" />
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
                <Ionicons name="chevron-forward" size={16} color="#7B2FF2" />
              </TouchableOpacity>
            </View>
            <Text className="text-muted-foreground text-sm">
              See what our customers are saying about their experience
            </Text>
          </View>

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
