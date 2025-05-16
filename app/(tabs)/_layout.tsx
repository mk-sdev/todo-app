import { Tabs } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

import { HapticTab } from '@/components/HapticTab'
import { IconSymbol } from '@/components/ui/IconSymbol'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import Entypo from '@expo/vector-icons/Entypo'
import Octicons from '@expo/vector-icons/Octicons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'lista',
          tabBarIcon: ({ color }) => (
            <Entypo name="list" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: 'dodaj',
          tabBarIcon: ({ color }) => (
            <Octicons name="diff-added" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cyclic-tasks"
        options={{
          title: 'zadania cykliczne',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="redo-alt" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
