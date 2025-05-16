import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { CyclicTask, Task } from '@/types'
import Feather from '@expo/vector-icons/Feather'
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

    // 3. Usuń z AsyncStorage tasks
    AsyncStorage.getItem('tasks')
      .then(stored => {
        if (!stored) return
        const parsed: Task[] = JSON.parse(stored)
        const updated = parsed.filter(task => task.parent !== taskToDelete.title)
        return AsyncStorage.setItem('tasks', JSON.stringify(updated))
      })
      .catch(err => {
        console.error('Błąd przy usuwaniu zadania:', err)
      })
  }

  return (
    <ScrollView style={{ marginTop: 100 }}>
      {cyclicTasks.map(item => (
        <ThemedView
          key={item.title}
          style={[styles.stepContainer, { padding: 10 }]}
        >
          <ThemedText style={{ fontWeight: 'bold', fontSize: 25 }}>
            {item.title}
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: 10, minHeight: 20 }}>
            {item.type === 0 && (
              <ThemedText style={{ paddingVertical: 10 }}>
                co ile dni:
                <ThemedText style={{ fontWeight: 'bold' }}>
                  {' ' + item.period}
                </ThemedText>
              </ThemedText>
            )}

            {item.type === 1 && (
              <ThemedText style={{ paddingVertical: 10 }}>
                dni tygodnia:
                <ThemedText style={{ fontWeight: 'bold' }}>
                  {' ' + item.weekDays?.map(weekDay => weekDay).join(', ')}
                </ThemedText>
              </ThemedText>
            )}

            {item.type === 2 && (
              <ThemedText style={{ paddingVertical: 10 }}>
                dni miesiąca:
                <ThemedText style={{ fontWeight: 'bold' }}>
                  {' ' + item.monthDays?.map(monthDay => monthDay).join(', ')}
                </ThemedText>
              </ThemedText>
            )}
          </View>
          <ThemedText style={{ fontWeight: 'bold', fontSize: 20 }}>
            {item.date} {item.time ? ` • ${item.time}` : ''}
          </ThemedText>

          <Feather
            name="trash-2"
            size={24}
            color="white"
            onPress={() => handleDelete(item)}
            style={{
              position: 'absolute',
              padding: 10,
              alignSelf: 'flex-end',
              backgroundColor: 'crimson',
              bottom: 0,
              borderTopLeftRadius: 10,
            }}
          />
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
          </ThemedView>
        )}
        keyExtractor={item => item.title}
      />
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
  stepContainer: {
    gap: 8,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    //padding: 10,
  },
})
