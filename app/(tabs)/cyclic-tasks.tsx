import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { CyclicTask, Task } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Button, FlatList, ScrollView, StyleSheet, View } from 'react-native'

export default function CyclicTasksScreen() {
  const [cyclicTasks, setCyclicTasks] = useState<CyclicTask[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
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
      ;(async () => {
        const cyclicTasks = await AsyncStorage.getItem('tasks')
        if (cyclicTasks) {
          const parsedCyclicTasks = JSON.parse(cyclicTasks)
          setAllTasks(parsedCyclicTasks)
          console.log('🚀 ~ parsedCyclicTasks:', parsedCyclicTasks)
        }
      })()
    }, [])
  )

  function handleDelete(taskToDelete: CyclicTask) {
    //TODO powinny się też usuwać taski w tasks których rodzicem jest dany cykliczny
    // 1. Usuń z lokalnego stanu
    setCyclicTasks(prevTasks =>
      prevTasks.filter(task => task.title !== taskToDelete.title)
    )

    // 2. Usuń z AsyncStorage
    AsyncStorage.getItem('cyclicTasks')
      .then(stored => {
        if (!stored) return
        const parsed: Task[] = JSON.parse(stored)
        const updated = parsed.filter(task => task.title !== taskToDelete.title)
        return AsyncStorage.setItem('cyclicTasks', JSON.stringify(updated))
      })
      .catch(err => {
        console.error('Błąd przy usuwaniu zadania:', err)
      })
  }

  return (
    <ScrollView style={{ marginTop: 100 }}>
      {cyclicTasks.map(item => (
        <ThemedView key={item.title} style={{ padding: 10 }}>
          <ThemedText
            style={{
              backgroundColor: 'red',
              padding: 10,
              position: 'absolute',
              right: 0,
            }}
            onPress={() => handleDelete(item)}
          >
            usun
          </ThemedText>
          <Button
            title="usun"
            color="red"
            onPress={() => handleDelete(item)}
          ></Button>
          <ThemedText>{item.title}</ThemedText>
          <ThemedText>{item.difficulty}</ThemedText>
          <ThemedText>{item.priority}</ThemedText>
          <ThemedText>{item.date}</ThemedText>
          <ThemedText>{item.time}</ThemedText>
        </ThemedView>
      ))}

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
      <ThemedText>Wszystkie:</ThemedText>
      <FlatList
        data={allTasks}
        renderItem={({ item }) => (
          <ThemedView
            style={[
              {
                gap: 8,
                marginBottom: 18,
                borderBottomWidth: 1,
                borderRadius: 10,
                overflow: 'hidden',
                padding: 10,
              },
            ]}
          >
            <View style={styles.titleContainer}>
              <ThemedText style={{ fontWeight: 'bold', fontSize: 15 }}>
                {item.date}
              </ThemedText>
              <ThemedText style={{ fontWeight: 'bold', fontSize: 20 }}>
                {item.title}
              </ThemedText>
            </View>
            {/* <ThemedText>Difficulty: {item.difficulty}</ThemedText>
            <ThemedText>Priority: {item.priority}</ThemedText> */}
          </ThemedView>
        )}
        keyExtractor={item => item.title}
      />
      <Button
        title="clear storage"
        onPress={async () => {
          await AsyncStorage.clear()
          console.log('🚀 ~ AsyncStorage.clear():')
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
    // flexDirection: 'row',
    gap: 8,
  },
})
