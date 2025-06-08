import Header from "@/components/home/header";
import QuickActions from "@/components/home/quick-actions";
import RecentTransactions from "@/components/home/recent-transactions";
import SocialHandles from "@/components/home/social-handles";
import WalletBox from "@/components/home/wallet-box";
import { useSession } from "@/components/session-context";
import { COLORS } from "@/constants/colors";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";

export default function Index() {

  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  const { refetchBalance, loadingBalance, refetchTransactions, loadingTransactions } = useSession()

  const handleRefresh = () => {
    refetchTransactions()
    refetchBalance()
  }

  return (
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

        <SocialHandles />
      </View>
    </ScrollView>
  );
}
