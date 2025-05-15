import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { CyclicTask } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Button, FlatList, StyleSheet, View, Text, ScrollView } from 'react-native'

export default function CyclicTasksScreen() {
  const [cyclicTasks, setCyclicTasks] = useState<CyclicTask[]>([])

  useFocusEffect(
    useCallback(() => {
      ;(async () => {
        const cyclicTasks = await AsyncStorage.getItem('cyclicTasks')
        if (cyclicTasks) {
          const parsedCyclicTasks = JSON.parse(cyclicTasks)
          setCyclicTasks(parsedCyclicTasks)
          console.log('🚀 ~ parsedCyclicTasks:', parsedCyclicTasks)
        }
      })()
    }, [])
  )
  return (
    <ScrollView style={{ marginTop: 100 }}>
      <FlatList
        data={cyclicTasks}
        renderItem={({ item }) => (
          <ThemedView>
            <ThemedText>{item.title}</ThemedText>
            <ThemedText>{item.difficulty}</ThemedText>
            <ThemedText>{item.priority}</ThemedText>
            <ThemedText>{item.date}</ThemedText>
            <ThemedText>{item.time}</ThemedText>
          </ThemedView>
        )}
        keyExtractor={(item) => item.title}
      />
      <Button
        title="console.log()"
        onPress={() => {
          ;(async () => {
            const tasks = await AsyncStorage.getItem('tasks')
            console.log('🚀 ~ tasks:', tasks)
            const cyclicTasks = await AsyncStorage.getItem('cyclicTasks')
            console.log('🚀 ~ cyclicTasks:', cyclicTasks)
          })()
        }}
      ></Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
})
