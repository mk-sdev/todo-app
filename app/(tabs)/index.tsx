import { CyclicTask, Task } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
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
        const newCyclicTasks = cyclicTasks.filter(
          cyclicTask =>
            !parsedTasks.some(
              existingTask =>
                existingTask.title === cyclicTask.title &&
                existingTask.date === day.toLocaleDateString('en-CA')
            )
        )

        newCyclicTasks.forEach(task => {
          task.date = day.toLocaleDateString('en-CA')
        })
        console.log('🚀 ~ setCyclicInstance ~ newCyclicTasks:', newCyclicTasks)

        const newTasks = [...parsedTasks, ...newCyclicTasks]
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
          await setCyclicInstance(cyclicTasksForThatDay)
        }

        //*

        const storedTasks = await AsyncStorage.getItem('tasks')
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks)
          console.log('🚀 ~ ; ~ parsedTasks:', parsedTasks)
          setTasks(
            parsedTasks.filter(
              (task: Task) => task.date === day.toLocaleDateString('en-CA')
            )
          )
        }
      })()
    }, [day])
  )

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
        minimumDate={new Date()}
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
        <View key={index} style={styles.stepContainer}>
          <View style={styles.titleContainer}>
            <Text style={{ fontWeight: 'bold' }}>{task.title}</Text>
          </View>
          <Text>Difficulty: {task.difficulty}</Text>
          <Text>Priority: {task.priority}</Text>
          <Text>Date: {task.date}</Text>
          <Text>Time: {task.time}</Text>
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
