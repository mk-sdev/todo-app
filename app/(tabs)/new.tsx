import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native'

import NewCyclic from '@/components/NewCyclic'
import Slider from 'react-native-ui-lib/slider'
import DateTimePicker from 'react-native-ui-lib/src/components/dateTimePicker'
import Switch from 'react-native-ui-lib/switch'
import { CyclicTask, Day, Task } from '../../types'
import { ThemedText } from '@/components/ThemedText'

export default function NewTaskScreen() {
  const [title, setTitle] = useState<string>('')
  const [difficulty, setDifficulty] = useState<number>(0)
  const [priority, setPriority] = useState<number>(0)
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<Date>(new Date())
  const [isTime, setIsTime] = useState<boolean>(false)
  //*** */
  const [isCyclic, setIsCyclic] = useState<boolean>(false)
  const [cyclicType, setCyclicType] = useState<0 | 1 | 2>(0)
  const [period, setPeriod] = useState<number>(1)
  const [monthDays, setMonthDays] = useState<number[]>([])
  const [weekDays, setWeekDays] = useState<Day[]>([])

  function addTask() {
    if (!title) {
      //jeśli jest cykliczne to data nie jest wymagana
      Alert.alert('Błąd', 'Tytuł jest wymagany')
      return
    }

    if (isCyclic) {
      const newTask: CyclicTask = {
        title,
        difficulty,
        priority,
        date: date.toLocaleDateString('en-CA'),
        time: isTime ? time.toLocaleTimeString('en-CA') : null,
        type: cyclicType,
        period: period ? period : null,
        weekDays: weekDays.length ? weekDays : null,
        monthDays: monthDays.length ? monthDays : null,
      }

      try {
        ;(async () => {
          const cyclicTasks = await AsyncStorage.getItem('cyclicTasks')
          if (cyclicTasks) {
            const parsedCyclicTasks = JSON.parse(cyclicTasks)
            //cykliczne zadania nie mogą mieć tej samej nazwy
            if (parsedCyclicTasks.some((task: any) => task.title === title)) {
              Alert.alert('Błąd', 'Zadanie o tej nazwie już istnieje')
              return
            }
            parsedCyclicTasks.push(newTask)
            await AsyncStorage.setItem(
              'cyclicTasks',
              JSON.stringify(parsedCyclicTasks)
            )
          } else {
            await AsyncStorage.setItem('cyclicTasks', JSON.stringify([newTask]))
          }
        })()

        reset()
        console.log('Cyclic task saved successfully!')
      } catch (error) {
        console.error('Error saving cyclic task:', error)
      }
    }

    if (!isCyclic) {
      const newTask: Task = {
        completed: false,
        title,
        difficulty,
        priority,
        date: date.toLocaleDateString('en-CA'),
        dateOfCompletion: null,
        time: isTime ? time.toLocaleTimeString('en-CA') : null,
        parent: null,
      }

      try {
        ;(async () => {
          const tasks = await AsyncStorage.getItem('tasks')
          if (tasks) {
            const parsedTasks = JSON.parse(tasks)
            if (
              parsedTasks.some(
                (task: any) =>
                  task.title === title &&
                  task.date === date.toLocaleDateString('en-CA')
              )
            ) {
              Alert.alert('Błąd', 'Zadanie o tej nazwie już istnieje')
              return
            }
            parsedTasks.push(newTask)
            await AsyncStorage.setItem('tasks', JSON.stringify(parsedTasks))
          } else {
            await AsyncStorage.setItem('tasks', JSON.stringify([newTask]))
          }
        })()

        reset()
        console.log('Task saved successfully!')
      } catch (error) {
        console.error('Error saving task:', error)
      }
    }
  }

  function reset() {
    setTitle('')
    setDifficulty(0)
    setPriority(0)
    setIsTime(false)
    setIsCyclic(false)
    setCyclicType(0)
    setPeriod(1)
    setMonthDays([])
    setWeekDays([])
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 20, paddingTop: 70 }}
      keyboardShouldPersistTaps="handled"
    >
      <DateTimePicker
        value={date}
        mode={'date'}
        locale="pl-PL"
        style={{ fontSize: 20, fontWeight: 'bold', color: 'silver' }}
        minimumDate={new Date()}
        onChange={value => {
          setDate(value)
        }}
        dateTimeFormatter={date =>
          date.toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }
      />
      <TextInput
        value={title}
        style={{ fontSize: 30, color: 'silver' }}
        placeholder="wpisz tytuł zadania"
        placeholderTextColor={'dimgray'}
        onChangeText={value => setTitle(value)}
      ></TextInput>

      <ThemedText style={styles.text}>Czy ustawić godzinę?</ThemedText>
      <Switch
        value={isTime}
        onValueChange={() => setIsTime(prev => !prev)}
      ></Switch>
      {isTime && (
        <DateTimePicker
          value={time}
          mode={'time'}
          locale="pl-PL"
          style={{ fontSize: 20, fontWeight: 'bold' }}
          onChange={value => {
            setTime(value)
          }}
          dateTimeFormatter={time =>
            time.toLocaleString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })
          }
        />
      )}

      <ThemedText style={styles.text}>
        Ustaw poziom trudności: {difficulty}
      </ThemedText>
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={5}
        value={difficulty}
        onValueChange={value => setDifficulty(value)}
        step={1} //? is it default?
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />
      <ThemedText style={styles.text}>Ustaw priorytet: {priority}</ThemedText>
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={5}
        value={priority}
        onValueChange={value => setPriority(value)}
        step={1} //? is it default?
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />
      <ThemedText style={styles.text}>Czy zadanie jest cykliczne?</ThemedText>
      <Switch
        value={isCyclic}
        onValueChange={() => setIsCyclic(prev => !prev)}
      ></Switch>
      {isCyclic && (
        <NewCyclic
          cyclicType={cyclicType}
          setCyclicType={setCyclicType}
          period={period}
          setPeriod={setPeriod}
          weekDays={weekDays}
          setWeekDays={setWeekDays}
          monthDays={monthDays}
          setMonthDays={setMonthDays}
        />
      )}

      <Button title="Dodaj zadanie" onPress={() => addTask()}></Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
  },
})
