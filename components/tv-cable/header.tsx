
import { COLORS } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { router, useNavigation } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Header = () => {
  const navigation = useNavigation()
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = COLORS[theme]

  return (
    <SafeAreaView edges={['top']} className="bg-background px-4 py-4">
      <View className="flex-row items-center justify-between w-full">
        <View className="flex-row items-center gap-x-1.5">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" color={colors.foreground} size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-medium text-foreground">Tv cable</Text>
        </View>

        <View className="flex-row items-center gap-x-4">
          <TouchableOpacity onPress={() => router.push('/help')}>
            <Ionicons name="headset-outline" color={colors.foreground} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Ionicons name="time-outline" color={colors.foreground} size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Header









// import { COLORS } from '@/constants/colors'
// import { Ionicons } from '@expo/vector-icons'
// import { router, Tabs } from 'expo-router'
// import React from 'react'
// import { Text, TouchableOpacity, useColorScheme, View } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated';


// const Header = () => {
//   const colorScheme = useColorScheme()
//   const theme = colorScheme === 'dark' ? 'dark' : 'light'

//   const colors = COLORS[theme]

//   return (
//     <Tabs.Screen 
//         options={{
//             headerShown: true,
//             header: ({navigation}) => (
//                 <View className={`${theme} flex-row bg-background`}>
//                     <SafeAreaView edges={['top']} className="flex-row items-center justify-between px-4 w-full py-4">
//                         <View className="flex-row items-center gap-x-1.5">
//                             <TouchableOpacity onPress={() => navigation.goBack()}>
//                                 <Ionicons name="arrow-back" color={colors.foreground} size={24} />
//                             </TouchableOpacity>
//                             <Text className="text-xl font-medium text-foreground">Electricity</Text>
//                         </View>

//                         <View className="flex-row items-center gap-x-4">
//                             <TouchableOpacity onPress={() => router.push(`/help`)}>
//                                 <Ionicons name="headset-outline" color={colors.foreground} size={24} />
//                             </TouchableOpacity>
//                             <TouchableOpacity onPress={() => router.push(`/history`)}>
//                                 <Ionicons name="time-outline" color={colors.foreground} size={24} />
//                             </TouchableOpacity>
//                         </View>
//                     </SafeAreaView>
//                 </View>
//             ),
//         }}
//     />
//   )
// }

// export default Header