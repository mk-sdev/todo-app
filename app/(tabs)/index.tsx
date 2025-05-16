import TaskList from '@/components/TaskList'
import { ThemedText } from '@/components/ThemedText'
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
import { Alert, Pressable, View } from 'react-native'
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
    Alert.alert('Usunąć zadanie?', '', [
      {
        text: 'Anuluj',
        style: 'cancel',
      },
      {
        text: 'Tak',
        onPress: () => {
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
        },
      },
    ])
  }

  function random() {
    const randomIndex = Math.floor(Math.random() * tasks.length)
    const randomTask = tasks[randomIndex]
    Alert.alert(
      'Wylosowane zadanie',
      `Tytuł: ${randomTask.title}\nData: ${randomTask.date}\nCzas: ${randomTask.time}`,
      [
        {
          text: 'OK',
          onPress: () => console.log('OK Pressed'),
        },
      ]
    )
  }

  return (
    <View style={{ marginTop: 55, padding: 10, flex: 1 }}>
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
          marginTop: 10,
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
      <TaskList
        tasks={tasks}
        day={day}
        handleDelete={handleDelete}
        toggleTaskCompletion={toggleTaskCompletion}
      ></TaskList>
      {tasks.length > 1 && (
        <Pressable
          style={{
            padding: 10,
            height: 50,
            backgroundColor: '#5846c7',
            borderRadius: 10,
            position: 'absolute',
            bottom: 20,
            width: '100%',
            left: 10,
          }}
          onPress={() => random()}
        >
          <ThemedText
            style={{
              fontSize: 20,
              alignSelf: 'center',
              fontWeight: 'bold',
              lineHeight: 30,
            }}
          >
            Losuj zadanie
          </ThemedText>
        </Pressable>
      )}
    </View>
  )
}
