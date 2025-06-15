import { COLORS } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { router, Tabs } from 'expo-router'
import React, { useState } from 'react'
import { Text, TouchableOpacity, useColorScheme, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Avatar from '../ui/avatar'
import { useSession } from '../session-context'
import BottomSheet from '../ui/bottom-sheet'
import { useGetNotifications } from '@/services/account-hooks'
import { format } from 'date-fns'

const Header = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const [showNotifications, setShowNotifications] = useState(false)
  const { data: notificationsData } = useGetNotifications()

  const notifications = notificationsData?.data || []

  const colors = COLORS[theme]
  const { user, session } = useSession()

  const getUserInitials = () => user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split(`@`)[0]

  const hasUnreadNotifications = notifications?.some(n => n.published)

  return (
    <>
      <Tabs.Screen 
          options={{
              headerShown: true,
              header: () => (
                  <View className={`${theme} flex-row bg-background`}>
                      <SafeAreaView edges={['top']} className="flex-row items-center justify-between px-4 w-full py-4">
                          <View className="flex-row items-center gap-x-1.5">
                              {
                                  user ? (
                                      <Avatar 
                                          source={ user?.user_metadata?.picture ? { uri: user?.user_metadata?.picture}: undefined }
                                          size={32}
                                      />
                                  ): (
                                      <Avatar 
                                          size={32}
                                      />
                                  )
                              }
                              <Text className="text-xl font-medium text-foreground">Hi, {getUserInitials() ? getUserInitials() : 'Guest'}.</Text>
                          </View>

                          <View className="flex-row items-center gap-x-4">
                              <TouchableOpacity>
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
      </BottomSheet>
    </>
  )
}

export default Header