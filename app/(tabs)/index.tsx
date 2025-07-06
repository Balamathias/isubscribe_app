import Header from "@/components/home/header";
import QuickActions from "@/components/home/quick-actions";
import RecentTransactions from "@/components/home/recent-transactions";
import SocialHandles from "@/components/home/social-handles";
import WalletBox from "@/components/home/wallet-box";
import { useSession } from "@/components/session-context";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { getGreeting } from "@/utils";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { RefreshControl, ScrollView, Text, useColorScheme, View } from "react-native";


export default function Index() {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  const { refetchBalance, loadingBalance, refetchTransactions, loadingTransactions, profile, user } = useSession()
  
    const getUserInitials = () => user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split(`@`)[0]

  const handleRefresh = () => {
    refetchTransactions()
    refetchBalance()
  }

  useEffect(() => {
    handleRefresh()

  }, [handleRefresh])

  return (
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
        <View className=" flex flex-col  ">
          <View className=" flex flex-row items-center">
            <Text className="text-lg  text-muted-foreground">{getGreeting()}, </Text>
            <Text className="text-lg  font-medium text-foreground">{getUserInitials() ? getUserInitials() : 'Guest'}.</Text>
          </View>
         <Text className="text-sm text-muted-foreground mt-1">What would you like to subscribe today?</Text>
        </View>

        <WalletBox />

        <QuickActions />

        <RecentTransactions />

        <SocialHandles />
      </View>
    </ScrollView>
  );
}
