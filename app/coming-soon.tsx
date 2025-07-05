import { Text, TouchableOpacity, View } from 'react-native'
import Header from '@/components/transactions/header'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const ComingSoon = () => {
    const router = useRouter()
  return (
    <View className='flex-1 bg-background/60'>
      <Header title={'Coming Soon'} />
     <View className="bg-card p-6 rounded-xl items-center justify-center m-4">
      <View className="bg-card p-6 rounded-xl items-center justify-center">
          <Ionicons name="battery-charging" size={48} color="#6b7280" />
          <Text className="text-foreground text-lg font-semibold mt-4 mb-2 animate-pulse">Coming soon...</Text>
          <Text className="text-muted-foreground text-center">
          This feature is coming soon on our mobile platform. For the meantime, you can enjoy this feature on our web platform.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/')}
          className="bg-primary px-6 py-3 rounded-2xl flex flex-row gap-x-1 items-center"
        >
           <Ionicons name="home-outline" size={20} color={'white'} className="mr-2" />
           <Text className="text-lg font-bold text-primary-foreground">Go to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
export default ComingSoon