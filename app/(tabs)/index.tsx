import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  checkCyclicTasks,
  getOldTasks,
  getOverdueTasks,
  getTasksState,
  getTasksToRemove,
  removeTasks,
  toggleTaskCompletionAsync,
} from '@/functions'
import { Task } from '@/types'
import Feather from '@expo/vector-icons/Feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  View
} from 'react-native'
import DateTimePicker from 'react-native-ui-lib/src/components/dateTimePicker'

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [day, setDay] = useState<Date>(new Date())
  // AsyncStorage.clear()

  useFocusEffect(
    useCallback(() => {
      ;(async () => {
        //** sprawdza czy na dany dzień wypadają jakies zadania cykliczne */
        const cyclicTasks = await AsyncStorage.getItem('cyclicTasks')

        if (cyclicTasks) {
          await checkCyclicTasks(day, cyclicTasks)
        }

        //* tutaj tworzony jest stan zadań do wyświetlenia dla usera
        const storedTasks = await AsyncStorage.getItem('tasks')
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks)

          // stare zadania, czyli z datą wcześniejszą niż dziś
          const oldTasks = getOldTasks(parsedTasks)

          // zaległe zadania do wyświetlenia
          const overdueTasks = getOverdueTasks(oldTasks, day)

          //? co jak zaległe zadanie jest cykliczne?
          // zadania z daną datą (cykliczne i zwykłe) + zaległe do wyświetlenia
          const tasksState = getTasksState(overdueTasks, parsedTasks, day)

          // jeśli zaległe były takie same jak zaplanowane na dziś to nie duplikuj
          const uniqueTasksState = Array.from(
            new Map(tasksState.map(task => [task.title, task])).values()
          )

          setTasks(uniqueTasksState)

          // zadania wykonane w przeszłości
          const tasksToRemove = getTasksToRemove(oldTasks, uniqueTasksState)
          //jeśli dobrze myślę to overdueTasks + tasksToRemove = oldTasks
          removeTasks(tasksToRemove)
        }
      })()
    }, [day])
  )

  function toggleTaskCompletion(title: string) {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.title === title
          ? {
              ...task,
              completed: !task.completed,
              dateOfCompletion: !task.completed
                ? new Date().toLocaleDateString('en-CA')
                : null,
            }
          : task
      )
    )
    toggleTaskCompletionAsync(title)
  }

  function handleDelete(taskToDelete: Task) {
    // 1. Usuń z lokalnego stanu
    setTasks(prevTasks =>
      prevTasks.filter(task => task.title !== taskToDelete.title)
    )

    // 2. Usuń z AsyncStorage
    AsyncStorage.getItem('tasks')
      .then(stored => {
        if (!stored) return
        const parsed: Task[] = JSON.parse(stored)
        const updated = parsed.filter(
          task =>
            !(
              task.title === taskToDelete.title &&
              task.date === taskToDelete.date
            )
        )
        return AsyncStorage.setItem('tasks', JSON.stringify(updated))
      })
      .catch(err => {
        console.error('Błąd przy usuwaniu zadania:', err)
      })
  }

  return (
    <View style={{ marginTop: 60, padding: 10 }}>
      <DateTimePicker
        value={day}
        mode={'date'}
        themeVariant="dark"
        locale="pl-PL"
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: 'silver',
          marginBottom: 20,
        }}
        // minimumDate={new Date()}
        onChange={(value: Date) => {
          setDay(value)
        }}
        dateTimeFormatter={(date: Date) =>
          date.toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }
      />
      <FlatList
        data={tasks}
        style={{ marginBottom: 40 }}
        keyExtractor={(item, index) => `${item.title}-${index}`} // lepiej użyć unikalnego id, jeśli masz
        renderItem={({ item: task }) => (
          <Pressable onPress={() => toggleTaskCompletion(task.title)}>
            <ThemedView
              style={[
                styles.stepContainer,
                { opacity: task.completed ? 0.3 : 1 },
                {
                  borderWidth: 1,
                  borderColor:
                    task.date < day.toLocaleDateString('en-CA')
                      ? 'tomato'
                      : 'transparent',
                },
              ]}
            >
              <View style={styles.titleContainer}>
                <ThemedText>
                  <ThemedText style={{ fontWeight: 'bold', fontSize: 25 }}>
                    {task.title}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontWeight: 'bold',
                      fontSize: 20,
                      color:
                        task.date < day.toLocaleDateString('en-CA')
                          ? 'tomato'
                          : 'white',
                    }}
                  >
                    {' •'} {task.date} {task.time ? ` • ${task.time}` : ''}
                  </ThemedText>
                </ThemedText>
              </View>
              <ThemedText>Difficulty: {task.difficulty}</ThemedText>
              <ThemedText>Priority: {task.priority}</ThemedText>
              <Feather
                name="trash-2"
                size={24}
                color="white"
                onPress={() => handleDelete(task)}
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
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    padding: 10,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})
