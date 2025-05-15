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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Button, ScrollView, StyleSheet } from 'react-native'
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
    <ScrollView
      contentContainerStyle={{ padding: 20 }}
      style={{ marginTop: 100 }}
    >
      <DateTimePicker
        value={day}
        mode={'date'}
        locale="pl-PL"
        style={{ fontSize: 20, fontWeight: 'bold', color: 'silver' }}
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
      {tasks.map((task, index) => (
        <ThemedView
          key={index}
          style={[
            styles.stepContainer,
            { backgroundColor: task.completed ? 'green' : '#171717' },
          ]}
        >
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={{ fontWeight: 'bold' }}>{task.title}</ThemedText>
          </ThemedView>
          <ThemedText
            style={{
              position: 'absolute',
              padding: 10,
              alignSelf: 'flex-end',
              backgroundColor: 'red',
            }}
            onPress={() => {
              handleDelete(task)
            }}
          >
            Usun
          </ThemedText>
          {task.date < day.toLocaleDateString('en-CA') && (
            <ThemedText style={{ backgroundColor: 'red' }}>zaległe</ThemedText>
          )}
          {/* <Text>{task.date } ||| { day.toLocaleDateString('en-CA')}</Text> */}
          <ThemedText>Difficulty: {task.difficulty}</ThemedText>
          <ThemedText>Priority: {task.priority}</ThemedText>
          <ThemedText>Date: {task.date}</ThemedText>
          <ThemedText>Time: {task.time}</ThemedText>
          <Button
            title="zaznacz jako wykonane"
            onPress={() => {
              toggleTaskCompletion(task.title)
            }}
          ></Button>
        </ThemedView>
      ))}
    </ScrollView>
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
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})
