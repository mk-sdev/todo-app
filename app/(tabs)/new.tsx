import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import RadioButton from 'react-native-ui-lib/radioButton'
import RadioGroup from 'react-native-ui-lib/radioGroup'
import Slider from 'react-native-ui-lib/slider'
import Checkbox from 'react-native-ui-lib/src/components/checkbox'
import DateTimePicker from 'react-native-ui-lib/src/components/dateTimePicker'
import Switch from 'react-native-ui-lib/switch'
import { Day, Task, CyclicTask } from '../../types'

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
          const tasks = await AsyncStorage.getItem('cyclicTasks')
          if (tasks) {
            const parsedTasks = JSON.parse(tasks)
            if (parsedTasks.some((task: any) => task.title === title)) {
              Alert.alert('Błąd', 'Zadanie o tej nazwie już istnieje')
              return
            }
            parsedTasks.push(newTask)
            await AsyncStorage.setItem(
              'cyclicTasks',
              JSON.stringify(parsedTasks)
            )
          } else {
            await AsyncStorage.setItem('cyclicTasks', JSON.stringify([newTask]))
          }
        })()

        setTitle('')
        setDifficulty(0)
        setPriority(0)
        setIsTime(false)
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
            parsedTasks.push(newTask)
            await AsyncStorage.setItem('tasks', JSON.stringify(parsedTasks))
          } else {
            await AsyncStorage.setItem('tasks', JSON.stringify([newTask]))
          }
        })()

        setTitle('')
        setDifficulty(0)
        setPriority(0)
        setIsTime(false)
        console.log('Task saved successfully!')
      } catch (error) {
        console.error('Error saving task:', error)
      }
    }
  }

  const daysOfWeek: { key: Day; label: string }[] = [
    { key: 'mon', label: 'Poniedziałek' },
    { key: 'tue', label: 'Wtorek' },
    { key: 'wed', label: 'Środa' },
    { key: 'thu', label: 'Czwartek' },
    { key: 'fri', label: 'Piątek' },
    { key: 'sat', label: 'Sobota' },
    { key: 'sun', label: 'Niedziela' },
  ]

  function toggleDay(day: Day) {
    setWeekDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 20, paddingTop: 40 }}
    >
      <TextInput
        value={title}
        style={{ fontSize: 20 }}
        placeholder="wpisz tytuł zadania"
        onChangeText={value => setTitle(value)}
      ></TextInput>
      <DateTimePicker
        value={date}
        mode={'date'}
        locale="pl-PL"
        style={{ fontSize: 20, fontWeight: 'bold' }}
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

      <Text style={styles.text}>Czy ustawić godzinę?</Text>
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
          dateTimeFormatter={date =>
            time.toLocaleString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })
          }
        />
      )}

      <Text style={styles.text}>Ustaw poziom trudności: {difficulty}</Text>
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
      <Text style={styles.text}>Ustaw priorytet: {priority}</Text>
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
      <Text style={styles.text}>Czy zadanie jest cykliczne?</Text>
      <Switch
        value={isCyclic}
        onValueChange={() => setIsCyclic(prev => !prev)}
      ></Switch>
      {isCyclic && (
        <>
          <View>
            <Text style={styles.text}>Jak często?</Text>
            <RadioGroup initialValue={0} style={{ gap: 10, paddingTop: 20 }}>
              <RadioButton
                label="Co X dni"
                value={0}
                selected
                onPress={() => setCyclicType(0)}
              />
              <RadioButton
                label="W określone dni tygodnia"
                value={1}
                onPress={() => setCyclicType(1)}
              />
              <RadioButton
                label="W określone dni miesiąca"
                value={2}
                onPress={() => setCyclicType(2)}
              />
            </RadioGroup>
          </View>
          <View>
            {cyclicType === 0 && (
              <>
                <Text style={styles.text}>Co ile dni?</Text>
                <Slider
                  style={{ width: 200, height: 40 }}
                  minimumValue={1}
                  maximumValue={30}
                  value={period}
                  onValueChange={value => setPeriod(value)}
                  step={1} //? is it default?
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#000000"
                />
                <Text style={styles.text}>
                  {period === 1 ? 'codziennie' : 'co ' + period + ' dni'}
                </Text>
              </>
            )}
            {cyclicType === 1 && (
              <>
                {daysOfWeek.map(({ key, label }) => (
                  <Checkbox
                    key={key}
                    label={label}
                    value={weekDays.includes(key as any)}
                    onValueChange={() => toggleDay(key)}
                    marginB-10
                  />
                ))}
              </>
            )}
            {cyclicType === 2 && (
              <>
                <Text>Wybierz dni miesiąca</Text>
                <View
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <Checkbox
                      key={i + 1}
                      label={`${i + 1}`}
                      value={monthDays.includes(i + 1)}
                      onValueChange={() =>
                        setMonthDays(prev =>
                          prev.includes(i + 1)
                            ? prev.filter(d => d !== i + 1)
                            : [...prev, i + 1]
                        )
                      }
                      marginB-5
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        </>
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
