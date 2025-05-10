import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import DateTimePicker from 'react-native-ui-lib/src/components/dateTimePicker'

export default function HomeScreen() {
  type Task = {
    completed: boolean
    title: string
    difficulty: number
    priority: number
    date: string
    time: string | null
    parent: string | null
    cyclic?: {
      type: 0 | 1 | 2
      period: number | null
      weekDays: Day[] | null
      monthDays: number[] | null
    }
  }
  type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  const [tasks, setTasks] = useState<Task[]>([])
  const [day, setDay] = useState<Date>(new Date())
  // AsyncStorage.clear()

  useEffect(() => {
    ;(async () => {
      const storedTasks = await AsyncStorage.getItem('tasks')
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks)
        setTasks(
          parsedTasks.filter(
            (task: Task) => task.date === day.toLocaleDateString('en-CA')
          )
        )
      }
      const cyclicTasks = await AsyncStorage.getItem('cyclicTasks')

      const todayWeekDay = day
        .toLocaleDateString('en-US', { weekday: 'short' })
        .toLowerCase() // np. 'mon'
      const todayDate = day.getDate() // dzień miesiąca

      if (cyclicTasks) {
        const parsedCyclicTasks = JSON.parse(cyclicTasks)
        parsedCyclicTasks.forEach((task: Task) => {
          const baseDate = new Date(task.date)
          const diffDays = Math.floor(
            (day.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          //@ts-ignore
          switch (task.cyclic.type) {
            case 0:
              //@ts-ignore // co X dni
              if (diffDays % task.cyclic.period === 0)
                setTasks(prev => [...prev, task])

              break

            case 1:
              //@ts-ignore // w określone dni tygodnia
              if (task?.cyclic.weekDays?.includes(todayWeekDay as Day))
                setTasks(prev => [...prev, task])

              break

            case 2:
              //@ts-ignore // w określone dni miesiąca
              if (task?.cyclic.monthDays?.includes(todayDate))
                setTasks(prev => [...prev, task])

              break
          }
        })
      }
    })()
  }, [day])
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
