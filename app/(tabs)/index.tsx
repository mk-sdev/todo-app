import { CyclicTask, Task } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native'
import DateTimePicker from 'react-native-ui-lib/src/components/dateTimePicker'

export default function HomeScreen() {
  type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  const [tasks, setTasks] = useState<Task[]>([])
  const [day, setDay] = useState<Date>(new Date())
  // AsyncStorage.clear()

  async function setCyclicInstance(cyclicTasks: CyclicTask[]) {
    console.log('🚀 ~ setCyclicInstance ~ cyclicTasks:', cyclicTasks)
    try {
      const storedTasks = await AsyncStorage.getItem('tasks')
      if (storedTasks) {
        const parsedTasks: Task[] = JSON.parse(storedTasks)

        // Dodaj tylko te zadania z cyclicTasks, których tytuły ORAZ daty nie występują w parsedTasks
        const filteredCyclicTasks = cyclicTasks.filter(
          cyclicTask =>
            !parsedTasks.some(
              existingTask =>
                existingTask.title === cyclicTask.title &&
                existingTask.date === day.toLocaleDateString('en-CA')
            )
        )

        const cyclicTasksInstances: Task[] = filteredCyclicTasks.map(
          cyclicTask => ({
            title: cyclicTask.title,
            difficulty: cyclicTask.difficulty,
            priority: cyclicTask.priority,
            date: day.toLocaleDateString('en-CA'),
            time: cyclicTask.time,
            completed: false,
            dateOfCompletion: null,
            parent: cyclicTask.title,
          })
        )

        console.log(
          '🚀 ~ setCyclicInstance ~ newCyclicTasks:',
          filteredCyclicTasks
        )

        const newTasks = [...parsedTasks, ...cyclicTasksInstances]
        await AsyncStorage.setItem('tasks', JSON.stringify(newTasks))
      } else {
        // Jeśli nie ma zapisanych zadań, zapisujemy wszystkie z cyclicTasks
        await AsyncStorage.setItem('tasks', JSON.stringify(cyclicTasks))
      }
    } catch (e) {
      console.error(e)
    }
  }

  useFocusEffect(
    useCallback(() => {
      ;(async () => {
        //** sprawdza czy na dany dzień wypadają jakies zadania cykliczne */
        const cyclicTasks = await AsyncStorage.getItem('cyclicTasks')

        const todayWeekDay = day
          .toLocaleDateString('en-US', { weekday: 'short' })
          .toLowerCase() // np. 'mon'
        const todayDate = day.getDate() // dzień miesiąca

        if (cyclicTasks) {
          const parsedCyclicTasks = JSON.parse(cyclicTasks)
          const cyclicTasksForThatDay: CyclicTask[] = []

          parsedCyclicTasks.forEach((task: CyclicTask) => {
            const baseDate = new Date(task.date)
            const diffDays = Math.floor(
              (day.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            switch (task.type) {
              case 0:
                //@ts-ignore // co X dni
                if (diffDays % task.period === 0)
                  //dodaj instancję do listy
                  cyclicTasksForThatDay.push(task)

                break

              case 1:
                // w określone dni tygodnia
                if (task?.weekDays?.includes(todayWeekDay as Day))
                  cyclicTasksForThatDay.push(task)

                break

              case 2:
                // w określone dni miesiąca
                if (task?.monthDays?.includes(todayDate))
                  cyclicTasksForThatDay.push(task)

                break
            }
          })
          //** jeśli wypadają, to są tworzone ich instancje z odpowiednią datą, o ile nie zostały już wcześniej utworzone */
          await setCyclicInstance(cyclicTasksForThatDay)
        }

        //* tutaj tworzony jest stan zadań do wyświetlenia dla usera
        const storedTasks = await AsyncStorage.getItem('tasks')
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks)

          // stare zadania, czyli z datą wcześniejszą niż dziś
          const oldTasks = parsedTasks.filter(
            (task: Task) => task.date < new Date().toLocaleDateString('en-CA')
          )

          // zaległe zadania do wyświetlenia
          const overdueTasks = oldTasks.filter(
            (task: Task) =>
              (!task.dateOfCompletion &&
                day.toLocaleDateString('en-CA') ===
                  new Date().toLocaleDateString('en-CA')) ||
              task.dateOfCompletion === day.toLocaleDateString('en-CA')
          )

          //? co jak zaległe zadanie jest cykliczne?
          // zadania z daną datą (cykliczne i zwykłe) + zaległe do wyświetlenia
          const tasksState = [
            ...overdueTasks,
            ...parsedTasks.filter(
              (task: Task) => task.date === day.toLocaleDateString('en-CA')
            ),
          ]
          // jeśli zaległe były takie same jak zaplanowane na dziś to nie duplikuj
          const uniqueTasksState = Array.from(
            new Map(tasksState.map(task => [task.title, task])).values()
          )

          setTasks(uniqueTasksState)
          oldTasks.forEach((task: Task) => {
            console.log(
              'tytul, data wykonania',
              task.title,
              task.dateOfCompletion
            )
          })

          // zadania wykonane w przeszłości
          const tasksToRemove = oldTasks.filter(
            (task: Task) =>
              (task.dateOfCompletion &&
                task.dateOfCompletion <
                  new Date().toLocaleDateString('en-CA')) ||
              (uniqueTasksState.some(t => t.title === task.title) &&
                task.parent !== null)
          )
          //jeśli dobrze myślę to overdueTasks + tasksToRemove = oldTasks
          removeTasks(tasksToRemove)
        }
      })()
    }, [day])
  )

  async function removeTasks(tasksToRemove: Task[]) {
    console.log('🚀 ~ do usunięcia:')
    tasksToRemove.forEach(task => {
      console.log(task.title, task.date)
    })
    try {
      const storedTasks = await AsyncStorage.getItem('tasks')
      if (!storedTasks) return

      const parsedTasks: Task[] = JSON.parse(storedTasks)

      const updatedTasks = parsedTasks.filter(
        task => !tasksToRemove.some(toRemove => toRemove.title === task.title)
      )

      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks))
    } catch (error) {
      console.error('Error removing tasks:', error)
    }
  }

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

  async function toggleTaskCompletionAsync(title: string) {
    try {
      const stored = await AsyncStorage.getItem('tasks')
      if (!stored) return

      const tasks = JSON.parse(stored)
      const updatedTasks = tasks.map((task: Task) =>
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

      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks))
    } catch (e) {
      console.error('Błąd podczas zapisywania zadania:', e)
    }
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
        style={{ fontSize: 20, fontWeight: 'bold' }}
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
        <View
          key={index}
          style={[
            styles.stepContainer,
            { backgroundColor: task.completed ? '#d3ffd3' : '#fff' },
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={{ fontWeight: 'bold' }}>{task.title}</Text>
          </View>
          {task.date < day.toLocaleDateString('en-CA') && (
            <Text style={{ backgroundColor: 'red' }}>zaległe</Text>
          )}
          {/* <Text>{task.date } ||| { day.toLocaleDateString('en-CA')}</Text> */}
          <Text>Difficulty: {task.difficulty}</Text>
          <Text>Priority: {task.priority}</Text>
          <Text>Date: {task.date}</Text>
          <Text>Time: {task.time}</Text>
          <Button
            title="zaznacz jako wykonane"
            onPress={() => {
              toggleTaskCompletion(task.title)
            }}
          ></Button>
        </View>
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
