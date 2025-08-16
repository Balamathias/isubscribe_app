import { COLORS } from '@/constants/colors'
import { useGetNotifications } from '@/services/api-hooks'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { router, Tabs } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSession } from '../session-context'
import Avatar from '../ui/avatar'
import BottomSheet from '../ui/bottom-sheet'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'react-native'
import { useThemedColors } from '@/hooks/useThemedColors'


const Header = () => {
  const colorScheme = useColorScheme()
  const { colors, theme } = useThemedColors()
  const [showNotifications, setShowNotifications] = useState(false)
  const { data: notificationsData } = useGetNotifications()

  const { user } = useSession()

  const notifications = notificationsData?.data || []

  const hasUnreadNotifications = notifications?.some(n => n.published)

  return (
    <>
      <Tabs.Screen 
          options={{
              headerShown: true,
              header: () => (
                  <View className={`${theme} flex-row bg-background`}>
                      <SafeAreaView edges={['top']} className="flex-row items-center justify-between px-3 w-full py-4">
                        <View className="flex-row items-center justify-center">
                            <Image
                                source={require('@/assets/images/logo-icon.png')}
                                className="w-11 h-11 mr-0.5"
                                style={{ tintColor: theme === 'dark' ? colors.foreground : colors.primary }}
                            />
                            <Text className="text-2xl font-semibold text-primary dark:text-foreground">isubscribe</Text>
                        </View>

                          <View className="flex-row items-center gap-x-4">
                              <TouchableOpacity onPress={() => router.push('/help')}>
                                  <Ionicons name="headset-outline" color={colors.foreground} size={24} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => setShowNotifications(true)}>
                                  <View>
                                      <Ionicons name="notifications-outline" color={colors.foreground} size={24} />
                                      {hasUnreadNotifications && (
                                          <View className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                                      )}
                                  </View>
                              </TouchableOpacity>
                              <Avatar onPress={user ? () => router.push('/profile-update') : undefined} fallback={user ? user?.user_metadata?.full_name?.at(0)?.toUpperCase() : undefined} source={user ? { uri: user?.user_metadata?.picture || '' } : undefined} size={30}/>
                          </View>
                      </SafeAreaView>
                  </View>
              ),
          }}
      />

      <BottomSheet
          isVisible={showNotifications}
          onClose={() => setShowNotifications(false)}
          title="Notifications"
      >
          <ScrollView className="flex-1">
              {notifications?.length === 0 ? (
                  <View className="flex-1 items-center justify-center py-8">
                      <Text className="text-foreground/60">No notifications yet</Text>
                  </View>
              ) : (
                  notifications?.map((notification, index) => (
                      <View 
                          key={notification.id} 
                          className={`p-4 border-b border-border ${!notification.published ? 'bg-primary/5' : ''}`}
                      >
                          <View className="flex-row justify-between items-start mb-2">
                              <Text className="text-foreground text-xl font-medium flex-1">
                                  {notification.title}
                              </Text>
                              <Text className="text-foreground/60 text-xs">
                                  {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                              </Text>
                          </View>
                          <Text className="text-foreground/80 text-lg">
                              {notification.description}
                          </Text>
                      </View>
                  ))
              )}
          </ScrollView>

          <TouchableOpacity 
              onPress={() => router.navigate('https://chat.whatsapp.com/FtUv7tE95Bt4vPbZ3DbNLS' as any)}
              className="mx-4 mb-4 bg-primary rounded-full p-4 flex-row items-center justify-center gap-x-2 mt-4 overflow-hidden"
              activeOpacity={0.6}
          >
             <LinearGradient
                colors={[colors.primary, '#f96ccf']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute inset-0 rounded-2xl"
                          />
              <Ionicons name="logo-whatsapp" size={24} color="white" />
              <Text className="text-white font-semibold text-base">Join our WhatsApp group for updates</Text>
          </TouchableOpacity>
      </BottomSheet>
    </>
  )
}

export default Header