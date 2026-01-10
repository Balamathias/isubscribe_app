import CustomerReviewsCard from "@/components/home/customer-reviews-card";
import Header from "@/components/home/header";
import QuickActions from "@/components/home/quick-actions";
import RecentTransactions from "@/components/home/recent-transactions";
import SocialHandles from "@/components/home/social-handles";
import WalletBox from "@/components/home/wallet-box";
import RatingsDisplayModal from "@/components/ratings/ratings-display-modal";
import { useSession } from "@/components/session-context";
import { useUpdateModal } from "@/components/ui/update-modal";
import { COLORS } from "@/constants/colors";
import { useNotification } from "@/contexts/notification-context";
import { useCreatePushToken } from "@/services/api-hooks";
import { getGreeting } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Platform, RefreshControl, ScrollView, Text, useColorScheme, View } from "react-native";
import PromoCarousel from "@/components/home/promo-carousel";
import QuickDataBuy from "@/components/data/quick-data-buy";
import { useThemedColors } from "@/hooks/useThemedColors";


export default function Index() {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  const { mutate: createPushToken } = useCreatePushToken()
  const { expoPushToken } = useNotification()
  const { UpdateModal } = useUpdateModal()

  const { refetchBalance, loadingBalance, refetchTransactions, loadingTransactions, profile, user } = useSession()
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const colors = useThemedColors().colors

  const handleRefresh = useCallback(() => {
    refetchTransactions()
    refetchBalance()
  }, [refetchTransactions, refetchBalance])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  useEffect(() => {
    if (expoPushToken && user) {
      createPushToken({ token: expoPushToken, user_id: user.id, device_type: Platform.OS as any }, {
        onSuccess: (response) => {
          console.log('Push token created successfully', response)
        },
        onError: (error) => {
          console.error('Error creating push token:', error)
        }
      })
    }
  }, [expoPushToken, createPushToken])

  const getUserInitials = () => user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split(`@`)[0]

  return (
    <>
      <ScrollView
        className={`${theme} flex-1 bg-background/90 dark:bg-background p-4 py-2 min-h-full`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingTransactions || loadingBalance}
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
              <Text className="text-lg font-medium dark:text-amber-400">{getUserInitials() ? getUserInitials() : 'Guest'}.</Text>
            </View>
            <Text className="text-sm text-muted-foreground mt-1">What would you like to subscribe today?</Text>
          </View>

          <WalletBox />

          <QuickActions />

          <QuickDataBuy />

          <PromoCarousel />

          <RecentTransactions />

          <CustomerReviewsCard onPress={() => setShowRatingsModal(true)} />

          <SocialHandles />
        </View>
      </ScrollView>

      <UpdateModal />

      <RatingsDisplayModal
        isVisible={showRatingsModal}
        onClose={() => setShowRatingsModal(false)}
      />
    </>
  );
}
