import AsyncStorage from '@react-native-async-storage/async-storage'
import Slider from 'react-native-ui-lib/slider'
import Switch from 'react-native-ui-lib/switch'
import RadioGroup from 'react-native-ui-lib/radioGroup'
import RadioButton from 'react-native-ui-lib/radioButton'
import { useState } from 'react'
import { Alert, Button, Text, TextInput, View } from 'react-native'
import DatePicker from 'react-native-date-picker'
import Checkbox from 'react-native-ui-lib/src/components/checkbox'

export default function NewTaskScreen() {
  const [title, setTitle] = useState<string>('')
  const [difficulty, setDifficulty] = useState<number>(0)
  const [priority, setPriority] = useState<number>(0)
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<Date>(new Date())
  const [isTime, setIsTime] = useState<boolean>(false)
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [openTimePicker, setOpenTimePicker] = useState(false)
  //*** */
  const [isCyclic, setIsCyclic] = useState<boolean>(false)
  const [cyclicType, setCyclicType] = useState<0 | 1 | 2>(0)
  const [period, setPeriod] = useState<number>(1)
  const [monthDays, setMonthDays] = useState<number[]>([])
  const [weekDays, setWeekDays] = useState<Day[]>([])

  function addTask() {
    if (!title || (!date && !isCyclic)) {
      //jeśli jest cykliczne to data nie jest wymagana
      Alert.alert('Błąd', 'Tytuł i data są wymagane')
      return
    }

    if (isCyclic) {
      const newTask = {
        title,
        difficulty,
        priority,
        date,
        time: isTime ? time : null,
        parent: title,
        cyclic: {
          type: cyclicType,
          period: period ? period : null,
          weekDay: weekDays.length ? weekDays : null,
          monthDay: monthDays.length ? monthDays : null,
        },
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
      const newTask = {
        title,
        difficulty,
        priority,
        date,
        time: isTime ? time : null,
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

  type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

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
    <View>
      <TextInput
        value={title}
        onChangeText={value => setTitle(value)}
      ></TextInput>
      <Text style={{ fontSize: 20 }} onPress={() => setOpenDatePicker(true)}>
        {date.toLocaleString('pl-PL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}{' '}
        Zmień datę
      </Text>
      <Text>Czy ustawić godzinę?</Text>
      <Switch
        value={isTime}
        onValueChange={() => setIsTime(prev => !prev)}
      ></Switch>
      <Text style={{ fontSize: 20 }} onPress={() => setOpenTimePicker(true)}>
        {isTime
          ? time.toLocaleString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Zmień godzinę'}
      </Text>
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
      <Text>Czy zadanie jest cykliczne?</Text>
      <Switch
        value={isCyclic}
        onValueChange={() => setIsCyclic(prev => !prev)}
      ></Switch>
      {isCyclic && (
        <>
          <View>
            <Text>Jak często?</Text>
            <RadioGroup>
              <RadioButton
                label="Co X dni"
                value={0}
                onPress={() => setDifficulty(0)}
              />
              <RadioButton
                label="W określone dni tygodnia"
                value={1}
                onPress={() => setDifficulty(1)}
              />
              <RadioButton
                label="W określone dni miesiąca"
                value={2}
                onPress={() => setDifficulty(2)}
              />
            </RadioGroup>
          </View>
          <View>
            {cyclicType === 0 && (
              <>
                <Text>Co ile dni?</Text>
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
                <Text>
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
                    marginB-10
                  />
                ))}
              </>
            )}
          </View>
        </>
      )}
      <DatePicker
        modal
        mode="date"
        open={openDatePicker}
        date={date}
        onConfirm={date => {
          setOpenDatePicker(false)
          setDate(date)
          // console.log(date)
        }}
        onCancel={() => {
          setOpenDatePicker(false)
        }}
        locale="pl-PL"
        title="Wybierz datę"
        cancelText="anuluj"
        confirmText="zatwierdź"
      />
      <DatePicker
        modal
        mode="time"
        open={openTimePicker}
        date={time}
        onConfirm={time => {
          setOpenTimePicker(false)
          setTime(time)
          // console.log(date)
        }}
        onCancel={() => {
          setOpenTimePicker(false)
        }}
        locale="pl-PL"
        title="Wybierz godzinę"
        cancelText="anuluj"
        confirmText="zatwierdź"
      />
      <Button title="Dodaj zadanie" onPress={() => addTask()}></Button>
    </View>
  )
}
