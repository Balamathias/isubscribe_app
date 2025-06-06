import Header from "@/components/home/header";
import QuickActions from "@/components/home/quick-actions";
import RecentTransactions from "@/components/home/recent-transactions";
import SocialHandles from "@/components/home/social-handles";
import WalletBox from "@/components/home/wallet-box";
import { ScrollView, useColorScheme, View } from "react-native";

export default function Index() {

  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  return (
    <ScrollView
      className={`${theme} flex-1 bg-background/50 dark:bg-background p-4 min-h-full`}
      showsVerticalScrollIndicator={false}
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
